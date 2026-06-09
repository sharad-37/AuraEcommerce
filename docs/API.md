# API Documentation

Complete API reference for AuraEcommerce.

**Base URL (Development)**

```http
http://localhost:3000/api
```

**Base URL (Production)**

```http
https://your-domain.com/api
```

---

# API Response Format

Every API response follows a consistent structure.

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

---

# Authentication

Protected routes require a JWT access token.

## Header

```http
Authorization: Bearer <access_token>
```

Example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# Authentication Endpoints

## Register User

### Endpoint

```http
POST /auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### Validation Rules

| Field    | Rule                        |
| -------- | --------------------------- |
| email    | Must be a valid email       |
| password | Minimum 8 characters        |
| password | At least 1 uppercase letter |
| password | At least 1 lowercase letter |
| password | At least 1 number           |

### Success Response

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "65f3a1b2",
      "email": "user@example.com"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Status Codes

| Code | Description          |
| ---- | -------------------- |
| 201  | User created         |
| 400  | Validation error     |
| 409  | Email already exists |

---

## Login User

### Endpoint

```http
POST /auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65f3a1b2",
      "email": "user@example.com"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Status Codes

| Code | Description         |
| ---- | ------------------- |
| 200  | Login successful    |
| 401  | Invalid credentials |

---

## Refresh Token

### Endpoint

```http
POST /auth/refresh
```

### Request Body

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

# Products Module

---

## Get All Products

### Endpoint

```http
GET /products
```

### Query Parameters

| Parameter | Type   | Description      |
| --------- | ------ | ---------------- |
| page      | Number | Page number      |
| limit     | Number | Items per page   |
| category  | String | Product category |
| search    | String | Search keyword   |
| sort      | String | Sort option      |

### Example

```http
GET /products?page=1&limit=12
```

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Premium Sneakers",
      "price": 1999,
      "category": "Footwear",
      "stock": 20
    }
  ]
}
```

---

## Get Product By ID

### Endpoint

```http
GET /products/:id
```

### Example

```http
GET /products/65f3a1b2
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "65f3a1b2",
    "name": "Premium Sneakers",
    "description": "Comfortable everyday sneakers",
    "price": 1999,
    "category": "Footwear",
    "stock": 20
  }
}
```

### Status Codes

| Code | Description       |
| ---- | ----------------- |
| 200  | Product found     |
| 404  | Product not found |

---

## Get Categories

### Endpoint

```http
GET /products/categories
```

### Response

```json
{
  "success": true,
  "data": ["Footwear", "Clothing", "Electronics", "Accessories"]
}
```

---

# Cart Module

All cart endpoints require authentication.

---

## Get User Cart

### Endpoint

```http
GET /cart
```

### Headers

```http
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "123",
        "quantity": 2
      }
    ]
  }
}
```

---

## Add To Cart

### Endpoint

```http
POST /cart
```

### Request Body

```json
{
  "productId": "123",
  "quantity": 1
}
```

### Response

```json
{
  "success": true,
  "message": "Item added to cart"
}
```

---

## Update Cart Item

### Endpoint

```http
PATCH /cart/:id
```

### Request Body

```json
{
  "quantity": 3
}
```

### Response

```json
{
  "success": true,
  "message": "Cart updated successfully"
}
```

---

## Remove Cart Item

### Endpoint

```http
DELETE /cart/:id
```

### Response

```json
{
  "success": true,
  "message": "Item removed successfully"
}
```

---

# Orders Module

All order endpoints require authentication.

---

## Create Order

### Endpoint

```http
POST /orders
```

### Request Body

```json
{
  "customerName": "John Doe",
  "mobile": "+91 9876543210",
  "address": "Mumbai, Maharashtra, India"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "ORD123456"
  }
}
```

---

## Get User Orders

### Endpoint

```http
GET /orders
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "ORD123",
      "status": "Pending",
      "total": 2999
    }
  ]
}
```

---

## Get Order By ID

### Endpoint

```http
GET /orders/:id
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "ORD123",
    "status": "Pending",
    "total": 2999,
    "items": []
  }
}
```

---

# Health Check

Used for monitoring and deployment verification.

## Endpoint

```http
GET /health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-06-09T12:00:00.000Z"
}
```

---

# Rate Limiting

All API routes are protected by rate limiting.

| Limit        | Window     |
| ------------ | ---------- |
| 100 Requests | 15 Minutes |

Response:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

---

# HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

# Security Features

- JWT Authentication
- Refresh Tokens
- Password Hashing using bcrypt
- Helmet Security Headers
- Rate Limiting
- Input Validation
- CORS Protection
- MongoDB Injection Protection

---

# Version

Current API Version:

```text
v1
```

---

Maintained by the AuraEcommerce Development Team.
