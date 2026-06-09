/**
 * Login page — authenticates an existing user.
 *
 * State management:
 * - submitting: signal to disable the button during requests
 * - serverError: signal to display API errors above the form
 * - shakeState: signal to trigger the shake animation on invalid submit
 *
 * Why signals instead of properties?
 * Signals integrate with Angular's change detection without zone polling,
 * making the UI more responsive. Templates read them with simple call syntax.
 */

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { shakeAnimation, slideDownAnimation } from '../../../animations';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    FormErrorComponent,
  ],
  animations: [shakeAnimation, slideDownAnimation],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly shakeState = signal<'idle' | 'shake'>('idle');
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group<LoginForm>({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  readonly emailErrorMessages = {
    required: 'Email is required',
    email: 'Please enter a valid email address',
  };

  readonly passwordErrorMessages = {
    required: 'Password is required',
    minlength: 'Password must be at least 8 characters',
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

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Welcome back!');
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err.error?.message ?? 'Login failed. Please try again.';
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
