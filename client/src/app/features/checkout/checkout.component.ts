/**
 * Checkout page — collects shipping info and places the order.
 *
 * Why redirect to cart if empty?
 * If a user navigates directly to /checkout with no items (e.g., bookmark),
 * there's nothing to checkout. Redirecting to cart is more helpful than
 * showing an error - they can see their (empty) cart and start shopping.
 *
 * Form structure mirrors the backend's createOrderValidation rules exactly.
 * Same validation client and server - UX on the client, security on the server.
 */

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import {
  fadeInUpAnimation,
  shakeAnimation,
  slideDownAnimation,
} from '../../animations';

interface CheckoutForm {
  customerName: FormControl<string>;
  mobile: FormControl<string>;
  address: FormControl<string>;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    NavbarComponent,
    FormErrorComponent,
  ],
  animations: [fadeInUpAnimation, shakeAnimation, slideDownAnimation],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly shakeState = signal<'idle' | 'shake'>('idle');

  readonly form = this.fb.nonNullable.group<CheckoutForm>({
    customerName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    mobile: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[+]?[\d\s\-()]{7,20}$/),
    ]),
    address: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
      Validators.minLength(10),
    ]),
  });

  readonly shippingFee = computed(() => {
    const sub = this.cartService.subtotal();
    return sub > 0 && sub < 50 ? 5.99 : 0;
  });

  readonly tax = computed(() =>
    Math.round(this.cartService.subtotal() * 0.08 * 100) / 100
  );

  readonly total = computed(() =>
    this.cartService.subtotal() + this.shippingFee() + this.tax()
  );

  readonly nameErrorMessages = {
    required: 'Please enter your full name',
    maxlength: 'Name is too long',
  };

  readonly mobileErrorMessages = {
    required: 'Mobile number is required',
    pattern: 'Please enter a valid mobile number',
  };

  readonly addressErrorMessages = {
    required: 'Delivery address is required',
    minlength: 'Please enter a complete address',
    maxlength: 'Address is too long',
  };

  ngOnInit(): void {
    // Pre-fill name from user email (best guess)
    const user = this.authService.currentUser();
    if (user?.email) {
      const namePart = user.email.split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      this.form.patchValue({ customerName: namePart });
    }

    // Guard against direct navigation with empty cart
    setTimeout(() => {
      if (this.cartService.items().length === 0) {
        this.toast.info('Your cart is empty');
        this.router.navigate(['/cart']);
      }
    }, 100);
  }

  onSubmit(): void {
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShake();
      return;
    }

    if (this.cartService.items().length === 0) {
      this.toast.error('Your cart is empty');
      this.router.navigate(['/cart']);
      return;
    }

    this.submitting.set(true);

    this.orderService.createOrder(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.cartService.clear();
            this.router.navigate(['/checkout/success', response.data.id]);
          }
        },
        error: (err: HttpErrorResponse) => {
          const message = err.error?.message ?? 'Failed to place order. Please try again.';
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
