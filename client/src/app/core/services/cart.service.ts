/**
 * Cart state and operations.
 *
 * Architecture:
 * - cartItems is a signal — reactive count and totals in templates
 * - itemCount is a computed signal — automatic recalculation on changes
 * - Operations call the API and update local state on success
 *
 * Why hydrate cart on service construction?
 * Users expect their cart to persist across sessions. The service eagerly
 * fetches the cart if the user is authenticated, so the navbar badge shows
 * the correct count immediately on page load.
 *
 * Why expose updateItemsOptimistically?
 * Cart pages need to update UI before the server confirms changes (optimistic UI).
 * This method allows that without exposing the private signal directly.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Cart, CartItem } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly itemCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadCart().subscribe();
      } else {
        this._items.set([]);
      }
    });
  }

  loadCart(): Observable<ApiResponse<Cart | null>> {
    return this.http.get<ApiResponse<Cart | null>>(this.apiUrl).pipe(
      tap((response) => {
        this._items.set(response.data?.items ?? []);
      }),
      catchError(() => {
        this._items.set([]);
        return of({ success: false, data: null });
      }),
    );
  }

  addToCart(
    productId: string,
    quantity: number,
  ): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(this.apiUrl, { productId, quantity })
      .pipe(
        tap((response) => {
          if (response.data?.items) {
            this._items.set(response.data.items);
          }
        }),
      );
  }

  updateItem(itemId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http
      .patch<ApiResponse<Cart>>(`${this.apiUrl}/${itemId}`, { quantity })
      .pipe(
        tap((response) => {
          if (response.data?.items) {
            this._items.set(response.data.items);
          }
        }),
      );
  }

  removeItem(itemId: string): Observable<ApiResponse<Cart | null>> {
    return this.http
      .delete<ApiResponse<Cart | null>>(`${this.apiUrl}/${itemId}`)
      .pipe(
        tap((response) => {
          this._items.set(response.data?.items ?? []);
        }),
      );
  }

  /**
   * Updates local cart state without an API call.
   * Used by cart pages for optimistic UI updates.
   */
  updateItemsOptimistically(items: CartItem[]): void {
    this._items.set(items);
  }

  clear(): void {
    this._items.set([]);
  }
}
