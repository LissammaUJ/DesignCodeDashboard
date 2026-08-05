import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth.service';

/** Attaches Accept + Authorization: Bearer &lt;token&gt; on API calls (except login). */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let headers = req.headers.set('Accept', 'application/json');

  const isApiRequest =
    req.url.startsWith(environment.apiUrl) ||
    req.url.includes(`${environment.apiUrl}/`) ||
    req.url.startsWith('/api');

  const isPublicAuth =
    /\/api\/login\b/i.test(req.url) ||
    /\/auth\/login\b/i.test(req.url) ||
    /\/company\/list\b/i.test(req.url);

  if (isApiRequest && !isPublicAuth) {
    const token = auth.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('[Auth] API request without token', { url: req.url, method: req.method });
    }
  }

  return next(req.clone({ headers }));
};
