import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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

/**
 * Logs HTTP failures. Does not logout on 401 —
 * api.interceptor handles refresh + logout-only-if-refresh-fails.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isPublic = isPublicApiUrl(req.url);

      if (error.status === 0) {
        console.error('[Network] API unreachable', {
          url: error.url ?? req.url,
          hint: 'API must allow CORS for http://localhost:4200. Proxy target or apiUrl should reach the API host.',
        });
      } else if (error.status === 401) {
        console.warn('[Auth] Unauthorized response', {
          url: error.url ?? req.url,
          isPublic,
          hint: isPublic
            ? 'Public endpoint rejected credentials / refresh token.'
            : 'api.interceptor will attempt refresh when applicable.',
        });
      }

      return throwError(() => error);
    })
  );
};
