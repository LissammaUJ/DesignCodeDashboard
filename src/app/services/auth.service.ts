import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../environments/environment';
import {
  ChangeCompanyRequest,
  CompanyOption,
  EmployeeLogin,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from '../models/auth.models';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_EXPIRES_KEY = 'refresh_expires_at';
const USER_KEY = 'auth_username';
const EXPIRES_KEY = 'auth_expires_at';
const REMEMBER_KEY = 'auth_remember_username';
const COMPANY_ID_KEY = 'auth_company_id';
const COMPANY_NAME_KEY = 'auth_company_name';
const EMPLOYEE_KEY = 'auth_employee';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  /** Single in-flight refresh so parallel 401s share one /api/auth/refresh call. */
  private refreshInFlight$: Observable<LoginResponse> | null = null;

  readonly isAuthenticated = signal(this.hasSession());
  /** Bumped on login / company change / refresh so UI computeds refresh. */
  readonly sessionVersion = signal(0);

  /** Public — interceptor must not attach JWT (see api.interceptor.ts). */
  getCompanies(): Observable<CompanyOption[]> {
    const url = `${this.apiUrl}/company/list`;
    console.debug('[Auth] Loading companies (public)', { url });
    return this.http.get<CompanyOption[]>(url).pipe(
      catchError((err) => this.mapHttpError(err, 'Unable to load companies.'))
    );
  }

  login(credentials: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    const body: LoginRequest = {
      emplCode: credentials.emplCode?.trim() ?? '',
      password: credentials.password ?? '',
      companyId: Number(credentials.companyId),
      companyName: credentials.companyName?.trim() ?? '',
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, body).pipe(
      tap((res) => this.persistSession(res, rememberMe ? body.emplCode : null)),
      catchError((err) => this.mapHttpError(err, 'Unable to sign in. Check that the API is running.'))
    );
  }

  changeCompany(request: ChangeCompanyRequest): Observable<LoginResponse> {
    const body: ChangeCompanyRequest = {
      companyId: Number(request.companyId),
      companyName: request.companyName?.trim() ?? '',
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/company/change`, body).pipe(
      tap((res) => this.persistSession(res, this.getRememberedUsername() || null)),
      catchError((err) => this.mapHttpError(err, 'Unable to change company.'))
    );
  }

  /**
   * Exchanges the stored refresh token for a new access + refresh pair.
   * Concurrent callers share one HTTP request (single-flight).
   */
  refreshSession(): Observable<LoginResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => ({
        status: 401,
        message: 'No refresh token available.',
        details: null,
      }));
    }

    const body: RefreshTokenRequest = { refreshToken };
    this.refreshInFlight$ = this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/refresh`, body)
      .pipe(
        tap((res) => this.persistSession(res, this.getRememberedUsername() || null)),
        catchError((err) => this.mapHttpError(err, 'Session expired. Please sign in again.')),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshInFlight$;
  }

  logout(redirectToLogin = true): void {
    this.clearSessionStorage();
    this.refreshInFlight$ = null;
    this.isAuthenticated.set(false);
    this.sessionVersion.update((v) => v + 1);
    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  /** Returns a non-expired access token, or null if missing/expired. */
  getToken(): string | null {
    if (!this.hasValidAccessToken()) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.hasValidRefreshToken()) {
      return null;
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  getEmployee(): EmployeeLogin | null {
    try {
      const raw = localStorage.getItem(EMPLOYEE_KEY);
      return raw ? (JSON.parse(raw) as EmployeeLogin) : null;
    } catch {
      return null;
    }
  }

  getCompanyId(): number | null {
    const raw = localStorage.getItem(COMPANY_ID_KEY);
    const id = raw != null ? Number(raw) : NaN;
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  getCompanyName(): string | null {
    return localStorage.getItem(COMPANY_NAME_KEY);
  }

  getRememberedUsername(): string {
    return localStorage.getItem(REMEMBER_KEY) ?? '';
  }

  /** True when access token is valid, or a refresh token can renew the session. */
  isLoggedIn(): boolean {
    const ok = this.hasSession();
    this.isAuthenticated.set(ok);
    return ok;
  }

  private persistSession(res: LoginResponse, rememberUsername: string | null): void {
    const token = res.accessToken?.trim();
    if (!token) {
      throw new Error('Login response did not include an access token.');
    }

    const expiresAt = Date.now() + (Number(res.expiresInSeconds) || 3600) * 1000;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, res.username ?? res.employee?.emplCode ?? '');
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));

    const refresh = res.refreshToken?.trim();
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      const refreshSeconds = Number(res.refreshExpiresInSeconds);
      if (Number.isFinite(refreshSeconds) && refreshSeconds > 0) {
        localStorage.setItem(REFRESH_EXPIRES_KEY, String(Date.now() + refreshSeconds * 1000));
      }
    }

    if (res.company?.coId) {
      localStorage.setItem(COMPANY_ID_KEY, String(res.company.coId));
      localStorage.setItem(COMPANY_NAME_KEY, res.company.coName ?? '');
    }

    if (res.employee) {
      localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(res.employee));
    }

    if (rememberUsername) {
      localStorage.setItem(REMEMBER_KEY, rememberUsername);
    }

    this.isAuthenticated.set(true);
    this.sessionVersion.update((v) => v + 1);
  }

  private hasSession(): boolean {
    return this.hasValidAccessToken() || this.hasValidRefreshToken();
  }

  private hasValidAccessToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token?.trim()) {
      return false;
    }

    const expiresRaw = localStorage.getItem(EXPIRES_KEY);
    if (expiresRaw) {
      const expiresAt = Number(expiresRaw);
      if (Number.isFinite(expiresAt) && Date.now() >= expiresAt) {
        return false;
      }
    }

    const expMs = this.readJwtExpiryMs(token);
    if (expMs != null && Date.now() >= expMs) {
      return false;
    }

    return true;
  }

  private hasValidRefreshToken(): boolean {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh?.trim()) {
      return false;
    }

    const expiresRaw = localStorage.getItem(REFRESH_EXPIRES_KEY);
    if (expiresRaw) {
      const expiresAt = Number(expiresRaw);
      if (Number.isFinite(expiresAt) && Date.now() >= expiresAt) {
        return false;
      }
    }

    return true;
  }

  private clearSessionStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(COMPANY_ID_KEY);
    localStorage.removeItem(COMPANY_NAME_KEY);
    localStorage.removeItem(EMPLOYEE_KEY);
  }

  private readJwtExpiryMs(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
        exp?: number;
      };
      return typeof json.exp === 'number' ? json.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private mapHttpError(err: any, fallback: string) {
    const message = err?.error?.message || err?.message || fallback;
    return throwError(() => ({
      status: err?.status ?? 0,
      message,
      details: err?.error?.details ?? null,
    }));
  }
}
