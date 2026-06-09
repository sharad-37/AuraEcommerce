/**
 * Product API client.
 *
 * Why explicit query parameter construction?
 * Using HttpParams with conditional appending ensures undefined values
 * don't end up as "category=undefined" in the URL. Cleaner URLs for users
 * and proper handling on the backend.
 *
 * Why getCategories is a separate call?
 * Categories are derived from products but cached at the backend (distinct query).
 * Fetching them separately allows the filter sidebar to render immediately
 * without waiting for product results.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductFilters,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  getProducts(
    filters: ProductFilters = {},
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sort) params = params.set('sort', filters.sort);

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`);
  }
}
