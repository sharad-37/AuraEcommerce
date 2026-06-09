# Architecture

This document explains the key architectural decisions in AuraEcommerce and the reasoning behind them. Every choice involves trade-offs — the rationale here helps reviewers understand not just _what_ was built but _why_.

---

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       Angular 17 SPA                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │   Auth   │ Products │   Cart   │ Checkout │  Shared  │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                 │
│  HTTP Interceptors → JWT injection, error handling              │
│  Route Guards     → Auth/guest gating                           │
│  Signal Services  → State (auth, cart), reactive in templates   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / JSON
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express REST API                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes → Validators → Controllers → Services → Models    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Middleware: Helmet, CORS, rate-limit, JWT auth, error handler  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB                                    │
│   Collections: users, products, carts, orders                   │
│   Indexes:     email(unique), category+price, text(name/desc)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Layered Design

We follow a strict layering pattern derived from Domain-Driven Design:

```
HTTP Request
    │
    ▼
[Route]            Defines URL, HTTP verb, middleware chain
    │
    ▼
[Validator]        Validates and sanitizes request body/params
    │
    ▼
[Controller]       Extracts data, calls service, formats response
    │
    ▼
[Service]          Business logic (auth flow, cart math, stock checks)
    │
    ▼
[Model]            Mongoose schema, database access
    │
    ▼
MongoDB
```

**Why this strictness?**

- **Single responsibility** — Each layer has one reason to change
- **Testability** — Services can be unit-tested without HTTP mocks
- **Substitutability** — Could swap Express → Fastify without touching services
- **Onboarding** — New developers immediately know where logic lives

### Why TypeScript on the Backend?

- Compile-time catches for type mismatches between layers
- IntelliSense for Mongoose model fields
- Self-documenting function signatures
- Refactoring safety (rename a model field, get errors everywhere it's used)

### Async Error Handling

We wrap every async controller with `asyncHandler()`:

```typescript
export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({ success: true, data: result });
});
```

This eliminates the try/catch boilerplate in every controller. Rejected promises propagate to the central `errorHandler` middleware, which formats responses consistently.

### Error Types

`AppError` is our custom error class with factory methods:

```typescript
throw AppError.notFound("Product"); // → 404
throw AppError.badRequest("Invalid input"); // → 400
throw AppError.unauthorized(); // → 401
```

`AppError.isOperational = true` distinguishes expected errors (bad input, missing resources) from bugs. Operational error messages are safe to expose to clients; bug messages are logged and a generic 500 is returned.

### Why JWT Over Sessions?

| Aspect             | JWT                     | Sessions                                 |
| ------------------ | ----------------------- | ---------------------------------------- |
| Server state       | Stateless               | Requires session store                   |
| Horizontal scaling | Trivial                 | Requires sticky sessions or shared store |
| Mobile apps        | Native fit              | Cookie management is awkward             |
| Revocation         | Harder (need blocklist) | Easy (delete session)                    |

For an API meant to serve a SPA and potentially mobile in the future, JWT is the right call. We mitigate the revocation weakness with **short-lived access tokens** (15 min) so a leaked token's blast radius is limited.

---

## Frontend Architecture

### Standalone Components Everywhere

Angular 17 makes standalone components the default. We use them exclusively because:

- **Smaller bundles** — Tree-shaking is more effective with explicit imports
- **No NgModule bookkeeping** — Add a component to a route, it just works
- **Cleaner lazy loading** — Routes load components directly, not modules wrapping components
- **Future-proof** — NgModule-based code is now legacy

### State Management Philosophy

We deliberately avoided NgRx. Here's the decision matrix:

| State concern                         | Solution chosen                       | Why                                                    |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| Current user                          | `signal<User>` in `AuthService`       | One source, reactive in templates                      |
| Cart items                            | `signal<CartItem[]>` in `CartService` | Computed `itemCount` and `subtotal` auto-update        |
| Toast notifications                   | `signal<Toast[]>` in `ToastService`   | Stack-like; signals are perfect for ephemeral UI       |
| Filter state (category, sort, search) | URL query params                      | Shareable, refresh-safe, browser-history-aware         |
| Form state                            | Reactive Forms                        | Synchronous access, composable validators, type-safe   |
| Server data                           | Direct service calls with RxJS        | Components subscribe via `subscribe()` or `toSignal()` |

**When would NgRx be justified?** Beyond ~10 features with cross-cutting state mutations, the action/reducer ceremony pays off. For this scale, signal-based services give us reactivity without the boilerplate.

### Why Functional Interceptors and Guards?

Angular 16+ introduced functional interceptors and guards. We use them because:

- **Easier to test** — Just functions taking inputs, returning outputs
- **Tree-shakable** — Unused ones get removed from the bundle
- **No provider registration boilerplate**
- **Class-based guards are deprecated**

Example:

```typescript
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(["/auth/login"], {
        queryParams: { returnUrl: state.url },
      });
};
```

### URL as State

Product filter state (category, search, sort, page) lives in URL query params, not component state. Benefits:

- Users can **share** filtered views via URL
- Browser **back/forward** works intuitively
- Page **refresh** preserves filters
- **SEO-crawlable** filtered views

The component reacts to `ActivatedRoute.queryParams` with `switchMap` to fetch products whenever the URL changes.

### Animation Strategy

- **Angular Animation API** for component lifecycle animations (enter, leave, route transitions)
  — They integrate with change detection and run on the main thread reliably
- **CSS keyframes** only for continuous animations (spinners, skeleton pulses)
  — These don't need Angular's overhead
- **`will-change: transform`** on hover-lift cards
  — Promotes them to their own compositor layer for 60fps

All animations respect `prefers-reduced-motion`:

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Optimistic UI

Cart quantity updates use optimistic UI:

1. User clicks `+` button
2. Local state updates **immediately** (UI re-renders)
3. API call fires in background (debounced 300ms to batch rapid clicks)
4. On error, reload cart to get authoritative state

This makes the app **feel instant** even with API latency.

---

## Database Design

### Why MongoDB?

- **Flexible schema** — Products have varying attributes (clothing has sizes, electronics have specs)
- **Embedded documents** — Cart items and order items naturally embed under their parent
- **Horizontal scaling** — Built-in sharding when traffic demands it

Trade-offs we accepted:

- No native JOINs (we use `.populate()` which is essentially a client-side JOIN)
- No ACID across collections without transactions (we use them for order creation)

### Indexing Strategy

| Collection | Index                                   | Rationale                                                              |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `users`    | `{ email: 1 }` unique                   | Login lookups, prevent duplicate registration                          |
| `products` | `{ category: 1, price: 1 }`             | Category-filtered queries sorted by price (most common access pattern) |
| `products` | `{ name: 'text', description: 'text' }` | Full-text search                                                       |
| `products` | `{ createdAt: -1 }`                     | "Newest first" default sort                                            |
| `carts`    | `{ user: 1 }` unique                    | One cart per user, O(1) lookup                                         |
| `orders`   | `{ user: 1, createdAt: -1 }`            | "My orders" page with chronological sort                               |
| `orders`   | `{ status: 1 }`                         | Admin filtering by order status                                        |

**Why compound `{ category: 1, price: 1 }` instead of two single-field indexes?**

MongoDB uses index prefixes — this compound index
supports all of the following efficiently:

- Filter by category
- Filter by category and sort by price
- Filter by category and apply price ranges

This avoids index intersections and improves query planner efficiency.

---

## Data Modeling Decisions

### Why Store Order Items as Embedded Documents?

Order items are copied into the order during checkout:

```ts
{
  (productId, productName, productPrice, quantity);
}
```

instead of referencing the Product collection.

### Benefits

- Historical accuracy
- Faster reads
- No additional joins/populates
- Orders remain immutable

If a product price changes tomorrow, existing orders still show the original purchase price.

---

## Cart Persistence Strategy

A cart exists both:

1. Client-side (Signals)
2. Server-side (MongoDB)

### Why Both?

Client State:

- Instant UI updates
- Offline-friendly behavior
- Better user experience

Server State:

- Cross-device persistence
- Recovery after refresh
- Central source of truth

### Synchronization Flow

```text
User Action
      │
      ▼
Angular Signal Update
      │
      ▼
API Request
      │
      ▼
MongoDB Update
      │
      ▼
Response Confirmation
```

---

# API Design Decisions

## RESTful Resource Design

Endpoints are resource-oriented:

```http
GET    /api/products
GET    /api/products/:id

POST   /api/cart
GET    /api/cart
DELETE /api/cart/:id

POST   /api/orders
GET    /api/orders
```

### Why REST Instead of GraphQL?

For an application of this size:

Benefits of REST:

- Simpler implementation
- Better caching support
- Lower complexity
- Faster development

GraphQL becomes more valuable when many clients require different data shapes.

---

## Standardized Response Format

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Benefits

- Predictable API contract
- Simpler frontend handling
- Consistent error reporting

---

# Security Design

## Password Storage

Passwords are never stored directly.

Process:

```text
User Password
      │
      ▼
bcrypt Hashing
      │
      ▼
Database
```

### Why bcrypt?

- Salt generation included
- Resistant to rainbow table attacks
- Industry standard

---

## Rate Limiting

Authentication endpoints are protected.

Example:

```text
100 Requests / 15 Minutes / IP
```

### Purpose

Protects against:

- Brute force attacks
- Credential stuffing
- Automated abuse

---

## Input Validation

Validation occurs before business logic.

Flow:

```text
Request
   │
   ▼
Validator
   │
   ▼
Controller
```

This prevents invalid data from reaching services or databases.

---

# Performance Strategy

## Frontend Performance

### Lazy Loading

Every major route is loaded on demand.

```ts
{
  path: 'products',
  loadComponent: () =>
    import('./products/products.component')
}
```

Benefits:

- Smaller initial bundle
- Faster first paint
- Improved Lighthouse score

---

### Debounced Search

Search input waits:

```text
350ms
```

before firing requests.

Benefits:

- Reduced server load
- Better user experience
- Lower bandwidth usage

---

### Computed Signals

Derived values use computed signals.

Example:

```ts
subtotal = computed(() =>
  this.cartItems().reduce(...)
);
```

Benefits:

- Automatic updates
- No manual subscriptions
- Minimal re-rendering

---

## Backend Performance

### Lean Queries

Read-heavy endpoints use:

```ts
Product.find().lean();
```

Benefits:

- Faster queries
- Lower memory usage
- Better throughput

---

### Pagination

Large datasets are paginated.

```http
GET /api/products?page=1&limit=12
```

Benefits:

- Smaller payloads
- Faster response times
- Better scalability

---

# Accessibility Strategy

Accessibility was considered throughout development.

### Implemented Features

- Semantic HTML
- Keyboard navigation
- Focus states
- ARIA labels
- Screen reader compatibility
- Reduced motion support

---

## Color Contrast

All UI colors maintain accessible contrast ratios.

Goals:

- WCAG AA Compliance
- Improved readability
- Better mobile visibility

---

# Deployment Architecture

Production deployment uses a three-tier architecture.

```text
┌──────────────────────┐
│ Angular Frontend     │
│ Vercel CDN           │
└──────────┬───────────┘
           │ HTTPS
           ▼
┌──────────────────────┐
│ Express API          │
│ Render              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ MongoDB Atlas        │
│ Managed Database     │
└──────────────────────┘
```

### Why This Setup?

Vercel:

- Fast global CDN
- Excellent Angular support

Render:

- Easy Node deployment
- Auto SSL
- Zero infrastructure management

MongoDB Atlas:

- Automated backups
- Monitoring
- Managed scaling

---

# Future Scalability

The architecture supports future growth without major rewrites.

Planned additions:

- Product Reviews
- Wishlist System
- Admin Dashboard
- Inventory Management
- Stripe Payments
- Email Notifications
- Recommendation Engine
- Docker Containers
- CI/CD Pipelines

---

# Trade-Offs & Lessons Learned

No architecture is perfect.

### Decisions We Made

| Decision                | Benefit                      | Trade-Off                    |
| ----------------------- | ---------------------------- | ---------------------------- |
| Signals instead of NgRx | Less boilerplate             | Less tooling for large teams |
| MongoDB                 | Flexible schema              | Weaker relational modeling   |
| JWT                     | Stateless auth               | Harder revocation            |
| Standalone Components   | Cleaner Angular architecture | Newer ecosystem patterns     |

Understanding these trade-offs is more important than blindly following trends.

---

# Conclusion

AuraEcommerce was designed as a production-oriented full-stack application demonstrating modern Angular, Node.js, Express, and MongoDB practices.

The architecture prioritizes:

- Maintainability
- Scalability
- Security
- Performance
- Accessibility
- Developer Experience

The result is a robust foundation that can evolve from a technical assessment project into a real-world commercial application with minimal architectural changes.
