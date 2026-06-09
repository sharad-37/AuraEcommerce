/**
 * Product listing page with URL-driven filters.
 *
 * State flow:
 * 1. User changes filter (category/sort/search/page)
 * 2. We navigate with merged query params (preserves other filters)
 * 3. ActivatedRoute.queryParams emits new values
 * 4. We fetch products with the new filters
 * 5. UI updates with results
 *
 * Search input uses debounce to avoid hammering the API on every keystroke.
 * 350ms is the empirically-validated sweet spot for search UX.
 *
 * Why a typed QueryParamsShape interface?
 * Angular's Params type is loose ({[key: string]: any}) which fails strict
 * TypeScript indexing rules. Casting to a typed shape gives us safer access
 * and better IntelliSense.
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { Pagination, Product, ProductFilters } from '../../../core/models';
import { fadeInUpAnimation, listStaggerAnimation } from '../../../animations';

interface QueryParamsShape {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductCardComponent,
    NavbarComponent,
  ],
  animations: [listStaggerAnimation, fadeInUpAnimation],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly pagination = signal<Pagination | null>(null);
  readonly loading = signal(true);

  readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly queryParamsRaw = toSignal(this.route.queryParams, {
    initialValue: {} as Params,
  });

  readonly queryParams = computed<QueryParamsShape>(
    () => this.queryParamsRaw() as QueryParamsShape,
  );

  readonly currentCategory = computed(() => this.queryParams().category ?? '');
  readonly currentSort = computed(() => this.queryParams().sort ?? 'newest');
  readonly currentPage = computed(() => Number(this.queryParams().page) || 1);
  readonly currentSearch = computed(() => this.queryParams().search ?? '');

  readonly sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price_asc', label: 'Price: Low to high' },
    { value: 'price_desc', label: 'Price: High to low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  readonly hasActiveFilters = computed(() => {
    const p = this.queryParams();
    return !!(p.category || p.search || (p.sort && p.sort !== 'newest'));
  });

  readonly pageNumbers = computed<(number | 'ellipsis')[]>(() => {
    const pag = this.pagination();
    if (!pag) return [];

    const current = pag.page;
    const total = pag.pages;
    const pages: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);

    return pages;
  });

  constructor() {
    this.loadCategories();

    this.route.queryParams
      .pipe(
        switchMap((params: Params) => {
          this.loading.set(true);
          const typed = params as QueryParamsShape;
          const filters: ProductFilters = {
            page: typed.page ? Number(typed.page) : 1,
            limit: 12,
            category: typed.category || undefined,
            search: typed.search || undefined,
            sort: (typed.sort as ProductFilters['sort']) || undefined,
          };
          return this.productService
            .getProducts(filters)
            .pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (response) => {
          this.products.set(response.data ?? []);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.products.set([]);
        },
      });

    this.searchControl.setValue(this.currentSearch(), { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.updateQueryParams({ search: value || null, page: null });
      });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => this.categories.set(response.data ?? []),
    });
  }

  selectCategory(category: string | null): void {
    this.updateQueryParams({
      category: category,
      page: null,
    });
  }

  changeSort(sort: string): void {
    this.updateQueryParams({ sort, page: null });
  }

  changePage(page: number): void {
    this.updateQueryParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  onAddToCart(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => this.toast.success(`${product.name} added to cart`),
      error: (err: HttpErrorResponse) => {
        if (!err.error?.message) {
          this.toast.error('Failed to add to cart');
        }
      },
    });
  }

  private updateQueryParams(
    params: Record<string, string | number | null>,
  ): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  trackByProductId(_index: number, product: Product): string {
    return product.id;
  }
}
