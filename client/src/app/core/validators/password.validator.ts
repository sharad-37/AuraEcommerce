/**
 * Custom validators for authentication forms.
 *
 * Why custom validators in the core module?
 * Validators are pure functions with no side effects — they belong with
 * other domain logic. Keeping them out of components ensures they can be
 * unit tested in isolation and reused across multiple forms.
 *
 * The password strength rules mirror the backend's express-validator rules.
 * Mirroring validation client+server is intentional: client-side for UX,
 * server-side for security.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /\d/.test(value);

  const valid = hasUpperCase && hasLowerCase && hasNumeric;
  return valid ? null : { passwordStrength: true };
}

export function passwordMatchValidator(
  passwordKey: string,
  confirmKey: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey);
    const confirm = control.get(confirmKey);

    if (!password || !confirm) return null;
    if (!confirm.value) return null;

    if (password.value !== confirm.value) {
      confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clear the passwordMismatch error if it exists, but preserve other errors
    if (confirm.errors) {
      const { passwordMismatch, ...rest } = confirm.errors;
      void passwordMismatch;
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}
