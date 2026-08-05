import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Logs HTTP failures and redirects to login on 401 (expired / invalid JWT). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = /\/auth\/login\b/i.test(req.url);

      if (error.status === 0) {
        console.error('[Network] API unreachable', {
          url: error.url ?? req.url,
          hint: 'Start DesignDashboard.Api on :100/:5000. For :4200 ensure proxy → :5000.',
        });
      } else if (error.status === 401) {
        console.warn('[Auth] Unauthorized response', {
          url: error.url ?? req.url,
          isLogin,
        });
        // Never clear session / redirect on failed login credentials.
        if (!isLogin) {
          auth.logout(true);
        }
      }

      return throwError(() => error);
    })
  );
};
