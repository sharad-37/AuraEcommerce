/**
 * Top navigation bar.
 *
 * Behavior:
 * - Translucent when at top, becomes solid on scroll for legibility
 * - Cart badge shows item count (computed from CartService signal)
 * - User menu shows email and logout when authenticated, login link when not
 *
 * Why scroll-driven background change?
 * Pages with hero images or colorful product grids benefit from a transparent
 * navbar that doesn't visually crowd content. But as the user scrolls past
 * the hero, the navbar must become opaque to stay legible against varied
 * backgrounds. This is the standard pattern on modern e-commerce (Apple,
 * Glossier, Aritzia).
 */

import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  animations: [
    trigger('dropdown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px) scale(0.96)' }),
        animate(
          '200ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms cubic-bezier(0.4, 0, 1, 1)',
          style({ opacity: 0, transform: 'translateY(-8px) scale(0.96)' }),
        ),
      ]),
    ]),
    trigger('badge', [
      transition(':increment', [
        style({ transform: 'scale(1)' }),
        animate(
          '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'scale(1.3)' }),
        ),
        animate(
          '200ms cubic-bezier(0.4, 0, 1, 1)',
          style({ transform: 'scale(1)' }),
        ),
      ]),
    ]),
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly mobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clear();
    this.toast.info('You have been signed out');
    this.closeMenu();
    this.router.navigate(['/products']);
  }

  getUserInitials(email: string): string {
    return email.charAt(0).toUpperCase();
  }
}
