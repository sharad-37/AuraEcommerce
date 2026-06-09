# Contributing Guide

Thank you for your interest in contributing to AuraEcommerce!

We welcome contributions of all sizes, whether it's fixing bugs, improving documentation, enhancing UI/UX, optimizing performance, or adding new features.

Please read this guide before submitting changes.

---

# Table of Contents

- Code of Conduct
- Development Workflow
- Project Setup
- Branching Strategy
- Commit Guidelines
- Pull Request Process
- Coding Standards
- Reporting Issues
- Feature Requests
- Security Vulnerabilities

---

# Code of Conduct

By participating in this project, you agree to:

- Be respectful and professional.
- Provide constructive feedback.
- Help create a welcoming environment.
- Respect differing viewpoints and experiences.

Unacceptable behavior includes:

- Harassment
- Discrimination
- Personal attacks
- Spam or malicious contributions

---

# Development Workflow

The recommended workflow is:

```text
Fork Repository
       │
       ▼
Create Feature Branch
       │
       ▼
Make Changes
       │
       ▼
Commit Changes
       │
       ▼
Push Branch
       │
       ▼
Create Pull Request
```

---

# Getting Started

## 1. Fork the Repository

Click the **Fork** button on GitHub.

---

## 2. Clone Your Fork

```bash
git clone https://github.com/your-username/AuraEcommerce.git

cd AuraEcommerce
```

---

## 3. Install Dependencies

### Backend

```bash
cd server

npm install
```

### Frontend

```bash
cd client

npm install
```

---

## 4. Configure Environment Variables

Create:

```env
server/.env
```

Example:

```env
PORT=3000

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=
```

---

## 5. Start Development Servers

### Backend

```bash
npm run dev
```

### Frontend

```bash
ng serve
```

---

# Branch Naming Convention

Use descriptive branch names.

## Features

```bash
feature/product-search

feature/payment-integration

feature/admin-dashboard
```

## Bug Fixes

```bash
fix/cart-total

fix/login-validation

fix/order-creation
```

## Documentation

```bash
docs/api-update

docs/readme-improvements
```

---

# Commit Message Guidelines

Use meaningful commit messages.

## Format

```text
type(scope): description
```

### Examples

```bash
feat(auth): add refresh token support

feat(cart): implement quantity updates

fix(products): resolve category filter issue

docs(api): update authentication endpoints

refactor(server): improve error handling
```

---

# Pull Request Process

Before opening a Pull Request:

- Ensure the application builds successfully.
- Ensure all tests pass.
- Update documentation if required.
- Resolve merge conflicts.

---

## Pull Request Template

### Description

Briefly describe the changes.

### Type of Change

- [ ] Bug Fix
- [ ] New Feature
- [ ] Refactoring
- [ ] Documentation Update
- [ ] Performance Improvement

### Testing

Describe testing performed.

Example:

```text
✓ Authentication tested

✓ Cart functionality tested

✓ Product filters tested
```

### Screenshots

Include screenshots for UI changes whenever possible.

---

# Coding Standards

## General Principles

- Write readable code.
- Keep functions focused.
- Avoid duplicated logic.
- Use meaningful variable names.
- Follow TypeScript best practices.

---

# Frontend Standards

## Angular Guidelines

### Component Naming

```typescript
product - card.component.ts;

cart - page.component.ts;
```

### Service Naming

```typescript
auth.service.ts;

product.service.ts;

cart.service.ts;
```

### Interface Naming

```typescript
User;

Product;

Order;
```

Avoid prefixes like:

```typescript
IUser;

IProduct;
```

---

## Styling

Preferred order:

```scss
.component {
  position: relative;

  display: flex;

  width: 100%;

  padding: 1rem;

  background: white;
}
```

Guidelines:

- Use SCSS variables.
- Avoid inline styles.
- Keep selectors specific.
- Use reusable utility classes.

---

# Backend Standards

## Controller Responsibilities

Controllers should:

- Receive requests
- Validate input
- Call services
- Return responses

Controllers should not:

- Contain business logic
- Access the database directly

---

## Service Responsibilities

Services should:

- Handle business logic
- Manage workflows
- Interact with models

Example:

```typescript
// Good
AuthController → AuthService → UserModel

// Bad
AuthController → UserModel
```

---

# Error Handling

Use centralized error handling.

Example:

```typescript
throw new ApiError(400, "Invalid product ID");
```

Avoid:

```typescript
res.status(400).send("Error");
```

---

# Reporting Bugs

Before creating an issue:

- Search existing issues.
- Verify the bug still exists.
- Include reproduction steps.

---

## Bug Report Template

### Description

Short summary of the issue.

### Steps to Reproduce

1. Navigate to Products
2. Add item to cart
3. Refresh page

### Expected Behavior

Cart should persist.

### Actual Behavior

Cart is cleared.

### Environment

```text
Browser:
Operating System:
Application Version:
```

---

# Feature Requests

Feature requests should include:

- Problem statement
- Proposed solution
- Alternatives considered
- Expected impact

Example:

```text
Problem:
Users cannot save products for later.

Solution:
Add Wishlist functionality.
```

---

# Security Issues

Do not create public GitHub issues for security vulnerabilities.

Instead, contact the maintainers privately.

Include:

- Vulnerability description
- Reproduction steps
- Potential impact
- Suggested fix

---

# Documentation Contributions

Documentation improvements are always welcome.

Examples:

- README improvements
- API documentation updates
- Architecture diagrams
- Deployment guides
- Tutorial creation

---

# Areas for Contribution

Current roadmap items:

- Wishlist System
- Product Reviews
- Payment Gateway Integration
- Admin Dashboard
- Inventory Management
- Email Notifications
- Order Tracking
- Progressive Web App

---

# Recognition

All contributors will be acknowledged in project releases and repository history.

Every contribution helps improve AuraEcommerce and is greatly appreciated.

---

# License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

Thank you for helping make AuraEcommerce better!
