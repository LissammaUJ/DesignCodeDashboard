import { CanActivateFn } from '@angular/router';

/**
 * Placeholder auth guard. API currently has no authentication.
 * When JWT is enabled, require `access_token` in localStorage.
 */
export const authGuard: CanActivateFn = () => true;
