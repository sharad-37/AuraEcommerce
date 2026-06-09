/**
 * Product card — displays a single product in a grid.
 *
 * Self-contained component:
 * - Handles its own loading state for image
 * - Emits addToCart event upward (parent handles the actual API call)
 * - Animated hover effects via CSS for performance
 *
 * Why emit instead of injecting CartService directly?
 * The card should be reusable in contexts where "add to cart" might mean
 * something different (e.g., admin product list). Emitting keeps the
 * component decoupled from cart semantics.
 */

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  readonly imageLoaded = signal(false);
  readonly adding = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.adding() || this.product.stock === 0) return;

    this.adding.set(true);
    this.addToCart.emit(this.product);

    // Visual feedback - reset after animation completes
    setTimeout(() => this.adding.set(false), 1000);
  }

  isOutOfStock(): boolean {
    return this.product.stock === 0;
  }

  isLowStock(): boolean {
    return this.product.stock > 0 && this.product.stock <= 5;
  }
}
