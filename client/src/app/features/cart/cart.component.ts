/**
 * Cart page — displays cart items with quantity editing and removal.
 *
 * Architecture:
 * - Cart state lives in CartService (signal-based)
 * - Quantity updates are debounced (300ms) to batch rapid +/- clicks
 * - Each item tracks its own loading state during updates
 * - Removal triggers a leave animation before API call
 *
 * Why local pendingUpdates map?
 * Multiple items might be updating simultaneously (user clicks rapidly).
 * A map keyed by item ID lets us track per-item state without conflicts.
 */

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CartItem } from '../../core/models';
import {
  fadeInUpAnimation,
  listStaggerAnimation,
  scaleInAnimation,
} from '../../animations';

interface PendingUpdate {
  itemId: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, NavbarComponent],
  animations: [listStaggerAnimation, fadeInUpAnimation, scaleInAnimation],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Per-item loading state during updates/removal
  readonly updatingItems = signal<Set<string>>(new Set());
  readonly removingItems = signal<Set<string>>(new Set());

  // Debounced quantity updates - prevents API spam on rapid +/- clicks
  private readonly quantityUpdate$ = new Subject<PendingUpdate>();

  readonly shippingFee = computed(() => {
    const sub = this.cartService.subtotal();
    return sub > 0 && sub < 50 ? 5.99 : 0;
  });

  readonly tax = computed(
    () => Math.round(this.cartService.subtotal() * 0.08 * 100) / 100,
  );

  readonly total = computed(
    () => this.cartService.subtotal() + this.shippingFee() + this.tax(),
  );

  constructor() {
    this.quantityUpdate$
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(({ itemId, quantity }) => {
        this.persistQuantity(itemId, quantity);
      });
  }

  incrementQuantity(item: CartItem): void {
    if (item.quantity >= item.product.stock || item.quantity >= 99) {
      this.toast.warning(`Only ${item.product.stock} in stock`);
      return;
    }
    this.optimisticUpdate(item, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity <= 1) return;
    this.optimisticUpdate(item, item.quantity - 1);
  }

  private optimisticUpdate(item: CartItem, newQuantity: number): void {
    // Update local state immediately for instant UI feedback
    const currentItems = this.cartService.items();
    const updated = currentItems.map((i) =>
      i.id === item.id ? { ...i, quantity: newQuantity } : i,
    );
    this.cartService.updateItemsOptimistically(updated);

    // Debounce the actual API call
    this.quantityUpdate$.next({ itemId: item.id, quantity: newQuantity });
  }

  private persistQuantity(itemId: string, quantity: number): void {
    this.updatingItems.update((set) => new Set(set).add(itemId));

    this.cartService
      .updateItem(itemId, quantity)
      .pipe(
        finalize(() => {
          this.updatingItems.update((set) => {
            const next = new Set(set);
            next.delete(itemId);
            return next;
          });
        }),
      )
      .subscribe({
        error: () => {
          // On error, reload cart to get authoritative state
          this.cartService.loadCart().subscribe();
        },
      });
  }

  removeItem(item: CartItem): void {
    this.removingItems.update((set) => new Set(set).add(item.id));

    // Small delay so the leave animation can play
    setTimeout(() => {
      this.cartService.removeItem(item.id).subscribe({
        next: () => {
          this.toast.success(`${item.product.name} removed from cart`);
        },
        error: () => {
          this.removingItems.update((set) => {
            const next = new Set(set);
            next.delete(item.id);
            return next;
          });
        },
      });
    }, 250);
  }

  proceedToCheckout(): void {
    if (this.cartService.itemCount() === 0) return;
    this.router.navigate(['/checkout']);
  }

  isUpdating(itemId: string): boolean {
    return this.updatingItems().has(itemId);
  }

  isRemoving(itemId: string): boolean {
    return this.removingItems().has(itemId);
  }

  trackByItemId(_index: number, item: CartItem): string {
    return item.id;
  }
}
