# Deployment Guide

This document explains how to deploy AuraEcommerce to production using modern cloud platforms.

---

# Deployment Architecture

```text
Frontend (Angular)
        │
        ▼
     Vercel
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
      Render
        │
        ▼
 MongoDB Atlas
```

---

# Prerequisites

Before deployment, ensure you have:

- GitHub Account
- MongoDB Atlas Account
- Render Account
- Vercel Account
- Production-ready source code

---

# Step 1: Push Project to GitHub

Initialize Git if not already done:

```bash
git init
git add .
git commit -m "Initial production release"
```

Create a GitHub repository and push:

```bash
git remote add origin https://github.com/yourusername/AuraEcommerce.git

git branch -M main

git push -u origin main
```

---

# Step 2: Setup MongoDB Atlas

## Create Cluster

1. Login to MongoDB Atlas
2. Create a new project
3. Create an M0 Free Cluster
4. Select your preferred cloud provider
5. Select nearest region

---

## Create Database User

Navigate to:

```text
Security → Database Access
```

Create a database user:

```text
Username: aura_admin
Password: StrongPassword 
```

Grant:

```text
Read and Write Access
```

---

## Configure Network Access

Navigate to:

```text
Security → Network Access
```

Add:

```text
0.0.0.0/0
```

For development and testing.

---

## Obtain Connection String

Navigate:

```text
Cluster → Connect → Drivers
```

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aura_ecommerce
```

---

# Step 3: Deploy Backend on Render

---

## Create New Web Service

Login to Render.

Select:

```text
New → Web Service
```

Connect your GitHub repository.

---

## Configure Build Settings

### Basic Configuration

| Setting        | Value                        |
| -------------- | ---------------------------- |
| Runtime        | Node                         |
| Root Directory | server                       |
| Branch         | main                         |
| Build Command  | npm install && npm run build |
| Start Command  | npm start                    |

---

## Environment Variables

Add the following variables:

```env
NODE_ENV=production

PORT=3000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

JWT_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

---

## Deploy Backend

Click:

```text
Create Web Service
```

Render will generate a URL.

Example:

```text
https://aura-api.onrender.com
```

Save this URL.

---

# Step 4: Configure Frontend Environment

Open:

```text
client/src/environments/environment.prod.ts
```

Update:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://aura-api.onrender.com/api",
};
```

Commit and push:

```bash
git add .
git commit -m "Configure production API"
git push
```

---

# Step 5: Deploy Frontend on Vercel

---

## Import Project

Login to Vercel.

Navigate:

```text
Add New → Project
```

Import:

```text
AuraEcommerce Repository
```

---

## Build Settings

| Setting          | Value               |
| ---------------- | ------------------- |
| Framework Preset | Angular             |
| Root Directory   | client              |
| Build Command    | npm run build       |
| Output Directory | dist/client/browser |

---

## Deploy

Click:

```text
Deploy
```

Example URL:

```text
https://aura-ecommerce.vercel.app
```

---

# Step 6: Configure Backend CORS

Return to Render.

Update:

```env
CORS_ORIGIN=https://aura-ecommerce.vercel.app
```

Redeploy backend.

---

# Environment Variables

## Backend

### Required

```env
NODE_ENV=production

PORT=3000

MONGODB_URI=

JWT_SECRET=

JWT_REFRESH_SECRET=

JWT_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=
```

---

## Frontend

Environment file:

```typescript
environment.ts;
environment.prod.ts;
```

Variables:

```typescript
apiUrl;
production;
```

---

# Production Checklist

## Security

- [ ] Change JWT secrets
- [ ] Use HTTPS
- [ ] Enable Helmet
- [ ] Enable Rate Limiting
- [ ] Configure CORS
- [ ] Protect Environment Variables

---

## Database

- [ ] MongoDB Atlas configured
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string verified

---

## Backend

- [ ] Build successful
- [ ] Health endpoint working
- [ ] Authentication working
- [ ] Product API working

---

## Frontend

- [ ] Application loads
- [ ] Login works
- [ ] Product listing works
- [ ] Cart functionality works
- [ ] Checkout works

---

# Health Check Endpoint

Verify deployment using:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

Example:

```text
https://aura-api.onrender.com/health
```

---

# Monitoring

Recommended services:

## Backend Monitoring

- Render Logs
- Better Stack
- Datadog

---

## Uptime Monitoring

- UptimeRobot
- Better Stack Monitoring

---

## Database Monitoring

MongoDB Atlas provides:

- Query Monitoring
- Connection Monitoring
- Performance Metrics
- Alerting

---

# Common Issues

## MongoDB Connection Failed

Check:

- Username
- Password
- Cluster URL
- Network Access Rules

---

## CORS Error

Verify:

```env
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

---

## Build Failed

Run locally:

```bash
npm run build
```

Fix all TypeScript errors before deployment.

---

## Render Cold Starts

Render free tier may sleep after inactivity.

Expected delay:

```text
20 - 40 seconds
```

Solutions:

- Upgrade Render plan
- Use uptime monitoring pings

---

# Recommended Production Stack

| Service          | Provider       |
| ---------------- | -------------- |
| Frontend Hosting | Vercel         |
| Backend Hosting  | Render         |
| Database         | MongoDB Atlas  |
| Monitoring       | Better Stack   |
| Version Control  | GitHub         |
| CI/CD            | GitHub Actions |

---

# Deployment Status

After successful deployment:

```text
Frontend:
https://your-vercel-domain.vercel.app

Backend:
https://your-render-domain.onrender.com

Database:
MongoDB Atlas
```

AuraEcommerce is now production-ready and accessible worldwide.
