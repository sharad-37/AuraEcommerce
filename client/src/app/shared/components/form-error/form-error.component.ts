/**
 * Displays validation errors for a form control.
 *
 * Why a dedicated component instead of inline templates?
 * - Every form would otherwise repeat the same conditional error markup
 * - Consistent animation across all error states
 * - Single place to update error messaging UX
 *
 * Usage:
 *   <app-form-error [control]="form.controls.email" [messages]="{ required: 'Email required' }" />
 */

import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { slideDownAnimation } from '../../../animations';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  animations: [slideDownAnimation],
  template: `
    @if (control && (control.touched || control.dirty) && control.errors) {
      <div class="form-error" @slideDown role="alert">
        <i class="bi bi-exclamation-circle-fill"></i>
        <span>{{ errorMessage() }}</span>
      </div>
    }
  `,
  styles: [
    `
      .form-error {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs);
        color: var(--color-danger);
        margin-top: 0.375rem;
        font-weight: 500;

        i {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class FormErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;
  @Input() messages: Record<string, string> = {};

  private readonly defaultMessages: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Value is too short',
    maxlength: 'Value is too long',
    pattern: 'Invalid format',
    passwordStrength:
      'Password must contain uppercase, lowercase, and a number',
    passwordMismatch: 'Passwords do not match',
  };

  errorMessage = computed(() => {
    if (!this.control?.errors) return '';

    const firstError = Object.keys(this.control.errors)[0];
    return (
      this.messages[firstError] ??
      this.defaultMessages[firstError] ??
      'Invalid value'
    );
  });

  // Force computed re-evaluation by tracking errors as a signal
  private _trigger = signal(0);
  ngDoCheck() {
    this._trigger.update((v) => v + 1);
  }
}
