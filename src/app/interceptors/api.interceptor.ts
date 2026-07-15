import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

/** Attaches common headers and optional JWT bearer token. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  let headers = req.headers.set('Accept', 'application/json');

  // Relative (/api/...) or absolute URLs that target the API base.
  const isApiRequest =
    req.url.startsWith(environment.apiUrl) ||
    req.url.includes(`${environment.apiUrl}/`) ||
    req.url.startsWith('/api');

  if (token && isApiRequest) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(req.clone({ headers }));
};
