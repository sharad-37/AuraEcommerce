/**
 * Protects routes that require authentication.
 *
 * If the user is not authenticated, they're redirected to /auth/login
 * with the original URL preserved as a query param for post-login redirect.
 *
 * Why functional guards?
 * Same reasoning as interceptors — simpler, more testable, tree-shakable.
 * Class-based guards (CanActivate) are deprecated in Angular 16+.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
