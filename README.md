# AuraEcommerce

A modern, full-stack e-commerce application built with **Angular 17**, **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

AuraEcommerce features a sleek glassmorphic user interface, secure JWT authentication, persistent shopping carts, responsive design, and a complete checkout workflow.

---

![License](https://img.shields.io/badge/license-MIT-green)
![Angular](https://img.shields.io/badge/Angular-17-red)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Status](https://img.shields.io/badge/status-active-success)

---

## Table of Contents

- Overview
- Features
- Technology Stack
- Project Structure
- Architecture
- Installation
- Environment Variables
- Running the Application
- API Documentation
- Deployment
- Documentation
- Screenshots
- Future Roadmap
- License
- Author

---

# Overview

AuraEcommerce is a production-ready e-commerce platform designed to demonstrate modern full-stack development practices.

The project showcases:

- Angular 17 Frontend Development
- REST API Development
- JWT Authentication
- MongoDB Database Design
- Responsive UI/UX
- Secure Application Architecture
- Cloud Deployment

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Refresh Tokens
- Protected Routes
- Secure Password Hashing

---

## Product Catalog

- Product Listing
- Product Details
- Search Functionality
- Category Filtering
- Sorting Options
- Pagination Support

---

## Shopping Cart

- Add To Cart
- Remove From Cart
- Quantity Management
- Persistent Cart Storage
- Optimistic UI Updates

---

## Checkout

- Customer Information Collection
- Order Processing
- Order Confirmation
- Order History Foundation

---

## User Experience

- Glassmorphism Design
- Responsive Layout
- Mobile-First Approach
- Smooth Animations
- Fast Performance

---

# Technology Stack

## Frontend

- Angular 17
- TypeScript
- RxJS
- Angular Signals
- Bootstrap 5
- SCSS

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

## Security

- JWT Authentication
- bcrypt
- Helmet
- CORS
- Rate Limiting

## Deployment

- Vercel
- Render
- MongoDB Atlas

---

# Project Structure

```text
AuraEcommerce/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   │
│   └── angular.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   │
│   └── package.json
│
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── TECH_STACK.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── README.md
└── LICENSE
```

---

# Architecture

```text
Angular Frontend
        │
        ▼
REST API (Express)
        │
        ▼
Business Logic Layer
        │
        ▼
MongoDB Database
```

For a detailed explanation, see:

```text
docs/ARCHITECTURE.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AuraEcommerce.git

cd AuraEcommerce
```

---

## Install Frontend Dependencies

```bash
cd client

npm install
```

---

## Install Backend Dependencies

```bash
cd server

npm install
```

---

# Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

JWT_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d
```

---

# Running the Application

## Start Backend

```bash
cd server

npm run dev
```

Backend:

```text
http://localhost:3000
```

---

## Start Frontend

```bash
cd client

ng serve
```

Frontend:

```text
http://localhost:4200
```

---

# API Documentation

Detailed API documentation is available at:

```text
docs/API.md
```

Endpoints include:

- Authentication
- Products
- Cart
- Orders
- Health Checks

---

# Deployment

Production deployment guide:

```text
docs/DEPLOYMENT.md
```

Recommended stack:

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Render        |
| Database | MongoDB Atlas |

---

# Documentation

Additional documentation:

| Document            | Description                 |
| ------------------- | --------------------------- |
| PROJECT_OVERVIEW.md | High-level project overview |
| TECH_STACK.md       | Technology breakdown        |
| ARCHITECTURE.md     | System architecture         |
| API.md              | API reference               |
| DEPLOYMENT.md       | Deployment guide            |
| CONTRIBUTING.md     | Contribution guidelines     |

---

# Screenshots

## Home Page

```text
Add Screenshot Here
```

---

## Product Listing

```text
Add Screenshot Here
```

---

## Product Details

```text
Add Screenshot Here
```

---

## Shopping Cart

```text
Add Screenshot Here
```

---

## Checkout

```text
Add Screenshot Here
```

---

# Security Features

- JWT Authentication
- Refresh Token Support
- bcrypt Password Hashing
- Helmet Security Headers
- Rate Limiting
- Input Validation
- CORS Protection

---

# Performance Optimizations

- Lazy Loading
- Angular Signals
- Optimistic UI Updates
- MongoDB Indexing
- Efficient API Responses

---

# Future Roadmap

### Customer Features

- Wishlist
- Product Reviews
- Ratings System
- Order Tracking

### Administrative Features

- Admin Dashboard
- User Management
- Product Management
- Sales Analytics

### Commerce Features

- Stripe Integration
- Razorpay Integration
- Coupon System
- Inventory Management

### Technical Enhancements

- Progressive Web App (PWA)
- Push Notifications
- Automated Testing
- GitHub Actions CI/CD

---

# Contributing

Contributions are welcome.

Please read:

```text
docs/CONTRIBUTING.md
```

before submitting a Pull Request.

---

# License

This project is licensed under the MIT License.

See:

```text
/LICENSE
```

for complete details.

---

# Author

## Sharad Manani

B.Tech Cyber Security Engineering

### Connect

- GitHub: https://github.com/sharad-37
- LinkedIn: https://linkedin.com/in/sharad-manani

---

## Acknowledgements

Special thanks to the open-source community and the maintainers of Angular, Node.js, Express, MongoDB, and TypeScript for providing the tools that made this project possible.

---

⭐ If you found this project useful, consider giving it a star on GitHub.
