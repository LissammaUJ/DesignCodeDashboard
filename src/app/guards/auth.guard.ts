import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Blocks dashboard routes unless a valid JWT is present. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  console.warn('[AuthGuard] Blocked — redirecting to /login');
  return router.createUrlTree(['/login']);
};

/** Sends authenticated users away from the login page. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
