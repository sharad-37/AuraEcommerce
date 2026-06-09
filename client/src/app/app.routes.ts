/**
 * Top-level route configuration.
 *
 * All feature routes are lazy-loaded via loadComponent.
 * Route guards are attached at the route level so guard logic runs
 * before the component is even loaded.
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
        title: 'Sign In · AuraEcommerce',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
        title: 'Create Account · AuraEcommerce',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
        title: 'Shop · AuraEcommerce',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/products/product-details/product-details.component').then(
            (m) => m.ProductDetailsComponent,
          ),
        title: 'Product · AuraEcommerce',
      },
    ],
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
    title: 'Cart · AuraEcommerce',
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
        title: 'Checkout · AuraEcommerce',
      },
      {
        path: 'success/:orderId',
        loadComponent: () =>
          import('./features/checkout/order-success/order-success.component').then(
            (m) => m.OrderSuccessComponent,
          ),
        title: 'Order Confirmed · AuraEcommerce',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
