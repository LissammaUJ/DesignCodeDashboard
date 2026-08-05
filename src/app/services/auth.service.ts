import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.models';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_username';
const EXPIRES_KEY = 'auth_expires_at';
const REMEMBER_KEY = 'auth_remember_username';

/**
 * Client-side JWT session (localStorage).
 * Backend currently uses hardcoded credentials; replace only the login API for DB auth later.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly isAuthenticated = signal(this.hasValidToken());

  login(credentials: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    const body: LoginRequest = {
      username: credentials.username?.trim() ?? '',
      password: credentials.password ?? '',
    };

    console.log('[Auth] Login request', {
      url: `${this.baseUrl}/login`,
      username: body.username,
      apiUrl: environment.apiUrl,
      rememberMe,
    });

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body).pipe(
      tap((res) => {
        console.log('[Auth] Login response', {
          username: res?.username,
          tokenType: res?.tokenType,
          expiresInSeconds: res?.expiresInSeconds,
          tokenPrefix: res?.accessToken?.slice(0, 16) + '…',
        });
        this.persistSession(res, rememberMe ? body.username : null);
      }),
      catchError((err) => {
        console.error('[Auth] Login failed', {
          status: err?.status,
          message: err?.error?.message ?? err?.message,
          url: err?.url,
        });
        const message =
          err?.error?.message ||
          err?.message ||
          'Unable to sign in. Check that the API is running.';
        return throwError(() => ({
          status: err?.status ?? 0,
          message,
          details: err?.error?.details ?? null,
        }));
      })
    );
  }

  logout(redirectToLogin = true): void {
    console.log('[Auth] Logout');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this.isAuthenticated.set(false);
    if (redirectToLogin) {
      void this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (!this.hasValidToken()) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  getRememberedUsername(): string {
    return localStorage.getItem(REMEMBER_KEY) ?? '';
  }

  isLoggedIn(): boolean {
    const ok = this.hasValidToken();
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
    localStorage.setItem(USER_KEY, res.username ?? '');
    localStorage.setItem(EXPIRES_KEY, String(expiresAt));

    if (rememberUsername) {
      localStorage.setItem(REMEMBER_KEY, rememberUsername);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    this.isAuthenticated.set(true);
    console.log('[Auth] Session stored', {
      username: res.username,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token?.trim()) {
      return false;
    }

    const expiresRaw = localStorage.getItem(EXPIRES_KEY);
    if (expiresRaw) {
      const expiresAt = Number(expiresRaw);
      if (Number.isFinite(expiresAt) && Date.now() >= expiresAt) {
        console.warn('[Auth] Token expired (local expiry metadata)');
        this.clearTokenOnly();
        return false;
      }
    }

    const expMs = this.readJwtExpiryMs(token);
    if (expMs != null && Date.now() >= expMs) {
      console.warn('[Auth] Token expired (JWT exp claim)');
      this.clearTokenOnly();
      return false;
    }

    return true;
  }

  private clearTokenOnly(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }

  private readJwtExpiryMs(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
      return typeof json.exp === 'number' ? json.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
