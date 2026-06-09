/**
 * Product details page.
 *
 * Why component input binding for the ID?
 * Angular 17's withComponentInputBinding() lets us declare @Input() id
 * and the router auto-fills it from the URL param. Cleaner than ActivatedRoute.
 *
 * Quantity selector uses signals for immediate UI reactivity.
 * Add to cart re-uses the same path as ProductCard - one less code path to maintain.
 */

import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { Product } from '../../../core/models';
import { fadeInUpAnimation, scaleInAnimation } from '../../../animations';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, NavbarComponent],
  animations: [fadeInUpAnimation, scaleInAnimation],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  @Input({ required: true }) id!: string;

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly quantity = signal(1);
  readonly adding = signal(false);
  readonly imageLoaded = signal(false);

  readonly canDecrement = computed(() => this.quantity() > 1);
  readonly canIncrement = computed(() => {
    const p = this.product();
    return p ? this.quantity() < Math.min(p.stock, 99) : false;
  });

  readonly totalPrice = computed(() => {
    const p = this.product();
    return p ? p.price * this.quantity() : 0;
  });

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    this.loading.set(true);
    this.notFound.set(false);

    this.productService
      .getProductById(this.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.product.set(response.data);
          } else {
            this.notFound.set(true);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.notFound.set(true);
          }
        },
      });
  }

  decrementQuantity(): void {
    if (this.canDecrement()) {
      this.quantity.update((q) => q - 1);
    }
  }

  incrementQuantity(): void {
    if (this.canIncrement()) {
      this.quantity.update((q) => q + 1);
    }
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  addToCart(): void {
    const product = this.product();
    if (!product || this.adding()) return;

    if (!this.authService.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.adding.set(true);

    this.cartService
      .addToCart(product.id, this.quantity())
      .pipe(finalize(() => this.adding.set(false)))
      .subscribe({
        next: () => {
          this.toast.success(
            `${this.quantity()} × ${product.name} added to cart`,
          );
        },
      });
  }

  buyNow(): void {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isAuthenticated()) {
      this.toast.info('Please sign in to continue');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.adding.set(true);
    this.cartService
      .addToCart(product.id, this.quantity())
      .pipe(finalize(() => this.adding.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/checkout']),
      });
  }

  isOutOfStock = computed(() => {
    const p = this.product();
    return p ? p.stock === 0 : false;
  });

  isLowStock = computed(() => {
    const p = this.product();
    return p ? p.stock > 0 && p.stock <= 5 : false;
  });
}
