/**
 * Attaches the Bearer access token to outgoing API requests.
 *
 * Why a functional interceptor?
 * Angular 17's functional interceptors are simpler to reason about,
 * easier to test, and better tree-shakable than class-based interceptors.
 *
 * The auth endpoints themselves (/auth/login, /auth/register, /auth/refresh)
 * are excluded — they don't need a token, and including one could cause
 * unintended behavior during refresh flows.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const AUTH_EXEMPT_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken;

  const isExempt = AUTH_EXEMPT_ROUTES.some((route) => req.url.includes(route));

  if (!token || isExempt) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};
