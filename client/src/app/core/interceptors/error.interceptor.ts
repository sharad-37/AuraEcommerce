/**
 * Centralized HTTP error handling.
 *
 * Responsibilities:
 * - 401 responses → log user out and redirect to login
 * - Server-provided error messages → show as toast
 * - Network failures → show friendly "connection lost" message
 * - 4xx/5xx → re-throw so components can react if needed
 *
 * Why not handle errors in each service?
 * Centralization ensures consistent UX. Without it, some components would
 * forget to show error toasts, leading to silent failures.
 */

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

const SUPPRESS_TOAST_ROUTES = ['/auth/login', '/auth/register'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const suppressToast = SUPPRESS_TOAST_ROUTES.some((r) =>
        req.url.includes(r),
      );

      if (error.status === 0) {
        toast.error('Cannot reach the server. Check your connection.');
        return throwError(() => error);
      }

      if (error.status === 401 && !req.url.includes('/auth/')) {
        authService.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
        toast.warning('Your session has expired. Please log in again.');
        return throwError(() => error);
      }

      if (!suppressToast) {
        const message = error.error?.message ?? 'An unexpected error occurred';
        toast.error(message);
      }

      return throwError(() => error);
    }),
  );
};
