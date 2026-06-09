/**
 * Registration page — creates a new user account.
 *
 * Includes a confirmPassword field with cross-field validation.
 * Includes a password strength indicator that updates live as the user types.
 *
 * Why a strength indicator?
 * Visual feedback during password creation reduces failed submissions and
 * teaches users what makes a strong password. Industry standard since ~2015.
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../../core/validators/password.validator';
import { shakeAnimation, slideDownAnimation } from '../../../animations';

interface RegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    FormErrorComponent,
  ],
  animations: [shakeAnimation, slideDownAnimation],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly shakeState = signal<'idle' | 'shake'>('idle');
  readonly showPassword = signal(false);

  // Track password value as a signal for live strength computation
  private readonly passwordValue = signal('');

  readonly form = this.fb.nonNullable.group<RegisterForm>(
    {
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        passwordStrengthValidator,
      ]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword'),
    },
  );

  constructor() {
    this.form.controls.password.valueChanges.subscribe((val) => {
      this.passwordValue.set(val ?? '');
    });
  }

  readonly passwordStrength = computed(() => {
    const value = this.passwordValue();
    if (!value) return { score: 0, label: '', color: '' };

    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;
    if (value.length >= 12) score++;

    const config = [
      { label: 'Too short', color: 'var(--color-danger)' },
      { label: 'Weak', color: 'var(--color-danger)' },
      { label: 'Fair', color: 'var(--color-warning)' },
      { label: 'Good', color: 'var(--color-info)' },
      { label: 'Strong', color: 'var(--color-success)' },
      { label: 'Excellent', color: 'var(--color-success)' },
    ];

    return { score, ...config[Math.min(score, 5)] };
  });

  readonly emailErrorMessages = {
    required: 'Email is required',
    email: 'Please enter a valid email address',
  };

  readonly passwordErrorMessages = {
    required: 'Password is required',
    minlength: 'Password must be at least 8 characters',
    passwordStrength: 'Include uppercase, lowercase, and a number',
  };

  readonly confirmPasswordErrorMessages = {
    required: 'Please confirm your password',
    passwordMismatch: 'Passwords do not match',
  };

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShake();
      return;
    }

    this.submitting.set(true);

    const { email, password } = this.form.getRawValue();

    this.authService
      .register({ email, password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Account created successfully!');
          this.router.navigateByUrl('/products');
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err.error?.message ?? 'Registration failed. Please try again.';
          this.serverError.set(message);
          this.triggerShake();
        },
      });
  }

  private triggerShake(): void {
    this.shakeState.set('shake');
    setTimeout(() => this.shakeState.set('idle'), 600);
  }
}
