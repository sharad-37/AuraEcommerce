/**
 * Authentication state and operations.
 *
 * Design decisions:
 * - currentUser is a signal (synchronous consumption in templates and guards)
 * - Tokens are exposed via getters (not signals) since they shouldn't trigger UI updates
 * - login/register persist tokens via StorageService and update state atomically
 * - logout clears all auth state and persisted tokens
 *
 * Why expose isAuthenticated as a computed signal?
 * Components and guards can directly call authService.isAuthenticated()
 * without subscribing or unwrapping observables.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  get accessToken(): string | null {
    return this.storage.get<string>(environment.tokenStorageKey);
  }

  get refreshToken(): string | null {
    return this.storage.get<string>(environment.refreshTokenStorageKey);
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.handleAuthSuccess(response.data)));
  }

  register(
    credentials: RegisterCredentials,
  ): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, credentials)
      .pipe(tap((response) => this.handleAuthSuccess(response.data)));
  }

  refreshAccessToken(): Observable<ApiResponse<{ tokens: AuthTokens }>> {
    const refreshToken = this.refreshToken;
    return this.http
      .post<
        ApiResponse<{ tokens: AuthTokens }>
      >(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          if (response.data?.tokens) {
            this.persistTokens(response.data.tokens);
          }
        }),
      );
  }

  logout(): void {
    this.storage.remove(environment.tokenStorageKey);
    this.storage.remove(environment.refreshTokenStorageKey);
    this.storage.remove(environment.userStorageKey);
    this._currentUser.set(null);
  }

  private handleAuthSuccess(data: AuthResponse | undefined): void {
    if (!data) return;
    this.persistTokens(data.tokens);
    this.storage.set(environment.userStorageKey, data.user);
    this._currentUser.set(data.user);
  }

  private persistTokens(tokens: AuthTokens): void {
    this.storage.set(environment.tokenStorageKey, tokens.accessToken);
    this.storage.set(environment.refreshTokenStorageKey, tokens.refreshToken);
  }

  private loadStoredUser(): User | null {
    return this.storage.get<User>(environment.userStorageKey);
  }
}
