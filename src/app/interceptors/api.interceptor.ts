import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

/** Attaches common headers and optional JWT bearer token. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  let headers = req.headers.set('Accept', 'application/json');

  if (token && req.url.startsWith(environment.apiUrl)) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(req.clone({ headers }));
};
