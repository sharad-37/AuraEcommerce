/**
 * Typed wrapper around localStorage with SSR safety.
 *
 * Why wrap localStorage?
 * - SSR safety: localStorage doesn't exist on the server
 * - Type safety: serialization/deserialization is centralized
 * - Testability: services depending on storage can mock this instead of globals
 * - Future flexibility: easy to swap to sessionStorage or IndexedDB
 */

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;

    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }
}
