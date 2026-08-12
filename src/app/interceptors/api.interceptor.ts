import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth.service';

const RETRY_HEADER = 'X-Auth-Retry';

/** Public API routes — never attach (or forward) a JWT. */
function isPublicApiUrl(url: string): boolean {
  return (
    /\/api\/company\/list\b/i.test(url) ||
    /\/api\/login\b/i.test(url) ||
    /\/api\/auth\/login\b/i.test(url) ||
    /\/api\/auth\/refresh\b/i.test(url) ||
    /\/auth\/login\b/i.test(url) ||
    /\/auth\/refresh\b/i.test(url) ||
    /\/company\/list\b/i.test(url)
  );
}

function isRefreshUrl(url: string): boolean {
  return /\/api\/auth\/refresh\b/i.test(url) || /\/auth\/refresh\b/i.test(url);
}

function isApiRequest(url: string): boolean {
  return (
    url.startsWith(environment.apiUrl) ||
    url.includes(`${environment.apiUrl}/`) ||
    url.startsWith('/api') ||
    /\/api\//i.test(url)
  );
}

/**
 * Attaches Authorization on protected API calls.
 * If access token is missing/expired but a refresh token exists, refresh first
 * (avoids a storm of unauthenticated 401s). On 401: single-flight refresh, retry once.
 * If refresh fails: clear session and redirect to login (no loop).
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let headers = req.headers.set('Accept', 'application/json');
  const isPublic = isPublicApiUrl(req.url);

  if (isPublic) {
    if (headers.has('Authorization')) {
      headers = headers.delete('Authorization');
    }
    return next(req.clone({ headers }));
  }

  if (!isApiRequest(req.url)) {
    return next(req.clone({ headers }));
  }

  const withAuth = (token: string | null) => {
    let h = headers;
    if (token) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return req.clone({ headers: h });
  };

  const handleUnauthorized = (failedReq: HttpRequest<unknown>, error: HttpErrorResponse) => {
    if (error.status !== 401 || isRefreshUrl(failedReq.url)) {
      return throwError(() => error);
    }

    if (failedReq.headers.has(RETRY_HEADER)) {
      auth.logout(true);
      return throwError(() => error);
    }

    if (!auth.getRefreshToken()) {
      auth.logout(true);
      return throwError(() => error);
    }

    return auth.refreshSession().pipe(
      switchMap(() => {
        const newToken = auth.getToken();
        if (!newToken) {
          auth.logout(true);
          return throwError(() => error);
        }

        const retryReq = failedReq.clone({
          setHeaders: {
            Accept: 'application/json',
            Authorization: `Bearer ${newToken}`,
            [RETRY_HEADER]: '1',
          },
        });
        return next(retryReq);
      }),
      catchError((refreshErr) => {
        auth.logout(true);
        return throwError(() => refreshErr);
      })
    );
  };

  // Access expired/missing but refresh available → refresh once, then send (single-flight).
  if (!auth.getToken() && auth.getRefreshToken()) {
    return auth.refreshSession().pipe(
      switchMap(() => {
        const token = auth.getToken();
        if (!token) {
          auth.logout(true);
          return throwError(() => ({
            status: 401,
            message: 'Session expired. Please sign in again.',
            details: null,
          }));
        }
        return next(withAuth(token)).pipe(
          catchError((error: HttpErrorResponse) => handleUnauthorized(withAuth(token), error))
        );
      }),
      catchError((refreshErr) => {
        auth.logout(true);
        return throwError(() => refreshErr);
      })
    );
  }

  const authReq = withAuth(auth.getToken());
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => handleUnauthorized(authReq, error))
  );
};
