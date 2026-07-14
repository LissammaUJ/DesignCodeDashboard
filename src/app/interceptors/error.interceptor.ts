import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Global HTTP error interceptor for consistent logging / propagation. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        console.error('[Network] API unreachable. Check CORS, HTTPS cert, and that the API is running.', error.url);
      } else if (error.status === 401) {
        console.warn('[Auth] Unauthorized – token may be missing or expired.');
      }
      return throwError(() => error);
    })
  );
};
