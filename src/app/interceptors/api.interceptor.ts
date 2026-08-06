import {
  HttpErrorResponse,
  HttpInterceptorFn,
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

/**
 * Attaches Authorization on protected API calls.
 * On 401: single-flight refresh, then retry the original request once.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let headers = req.headers.set('Accept', 'application/json');

  const isApiRequest =
    req.url.startsWith(environment.apiUrl) ||
    req.url.includes(`${environment.apiUrl}/`) ||
    req.url.startsWith('/api') ||
    /\/api\//i.test(req.url);

  const isPublic = isPublicApiUrl(req.url);

  if (isPublic) {
    if (headers.has('Authorization')) {
      headers = headers.delete('Authorization');
    }
    return next(req.clone({ headers }));
  }

  if (isApiRequest) {
    const token = auth.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isPublic || isRefreshUrl(req.url)) {
        return throwError(() => error);
      }

      // Already retried once — do not loop.
      if (req.headers.has(RETRY_HEADER)) {
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

          const retryReq = req.clone({
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
    })
  );
};
