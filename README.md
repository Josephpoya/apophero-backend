# Apophero Health — Backend API

Production-ready REST API built with **Node.js + Express + MongoDB**.

---

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Runtime      | Node.js 18+                         |
| Framework    | Express 4                           |
| Database     | MongoDB (Mongoose ODM)              |
| Auth         | JWT + httpOnly Cookies              |
| Email        | Nodemailer (SMTP)                   |
| Validation   | express-validator                   |
| Security     | Helmet, CORS, HPP, XSS-Clean, Mongo-Sanitize |
| Rate Limiting| express-rate-limit                  |
| Uploads      | Multer                              |
| Logging      | Winston                             |
| Testing      | Jest + Supertest                    |

---

## Project Structure

```
apophero-backend/
├── server.js                 ← Entry point
├── Procfile                  ← Railway/Render deployment
├── .env.example              ← Environment variable template
├── jest.config.js
├── config/
│   └── db.js                 ← MongoDB connection
├── controllers/
│   ├── authController.js     ← Register, login, password reset
│   ├── mainControllers.js    ← Contact, newsletter, bookings, blog
│   └── adminController.js    ← Admin dashboard & management
├── middleware/
│   ├── auth.js               ← JWT protect, restrictTo, optionalAuth
│   ├── errorHandler.js       ← Global error handler
│   ├── upload.js             ← Multer file upload
│   └── validators.js         ← express-validator rules
├── models/
│   ├── User.js               ← User schema
│   └── index.js              ← Contact, Newsletter, Booking, Blog schemas
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── contactRoutes.js
│   ├── newsletterRoutes.js
│   ├── bookingRoutes.js
│   ├── blogRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── AppError.js           ← Custom error class
│   ├── email.js              ← Nodemailer + HTML templates
│   ├── helpers.js            ← asyncHandler, pagination, generateRef
│   ├── logger.js             ← Winston logger
│   └── seeder.js             ← DB seed / clear script
├── tests/
│   └── api.test.js           ← Full Jest + Supertest test suite
├── uploads/                  ← Uploaded images (gitignored)
└── logs/                     ← Log files (gitignored)
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd apophero-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in your values (MongoDB URI, SMTP, JWT secret)
```

### 3. Seed the Database
```bash
npm run seed
# Creates admin user + 7 sample blog posts
# Admin credentials printed in terminal
```

### 4. Run Development Server
```bash
npm run dev
# API available at http://localhost:5000
```

### 5. Run Tests
```bash
npm test
```

---

## Environment Variables

| Variable              | Description                              |
|-----------------------|------------------------------------------|
| `NODE_ENV`            | `development` or `production`            |
| `PORT`                | Server port (default: 5000)              |
| `CLIENT_URL`          | Frontend URL (for CORS + email links)    |
| `MONGO_URI`           | MongoDB Atlas connection string          |
| `JWT_SECRET`          | 64-char random hex string                |
| `JWT_EXPIRE`          | Token expiry (e.g. `7d`)                 |
| `JWT_COOKIE_EXPIRE`   | Cookie expiry in days                    |
| `ADMIN_NAME`          | Seed admin display name                  |
| `ADMIN_EMAIL`         | Seed admin email                         |
| `ADMIN_PASSWORD`      | Seed admin password                      |
| `SMTP_HOST`           | SMTP server (e.g. `smtp.gmail.com`)      |
| `SMTP_PORT`           | SMTP port (`587` for TLS)                |
| `SMTP_USER`           | SMTP username / email                    |
| `SMTP_PASS`           | SMTP password / app password             |
| `FROM_NAME`           | Email sender display name                |
| `FROM_EMAIL`          | Email sender address                     |
| `MAX_FILE_SIZE`       | Max upload size in bytes (default: 5MB)  |

---

## API Reference

### Base URL
```
https://your-api.railway.app/api/v1
```

---

### 🔐 Auth  `/api/v1/auth`

| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| POST   | `/register`                 | Public   | Create account           |
| POST   | `/login`                    | Public   | Login, receive JWT       |
| POST   | `/logout`                   | Public   | Clear auth cookie        |
| GET    | `/me`                       | 🔒 User  | Get own profile          |
| PATCH  | `/update-me`                | 🔒 User  | Update name/email        |
| PATCH  | `/change-password`          | 🔒 User  | Change password          |
| POST   | `/forgot-password`          | Public   | Send reset email         |
| PATCH  | `/reset-password/:token`    | Public   | Reset with token         |

**Register / Login body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Pass1234!" }
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
  }
}
```

---

### ✉️ Contact  `/api/v1/contact`

| Method | Endpoint | Auth   | Description       |
|--------|----------|--------|-------------------|
| POST   | `/`      | Public | Submit contact form (rate limited: 5/hr) |

**Body:**
```json
{
  "firstName": "Jane", "lastName": "Doe",
  "email": "jane@example.com",
  "subject": "Question about guides",
  "message": "I have a question about..."
}
```

---

### 📧 Newsletter  `/api/v1/newsletter`

| Method | Endpoint              | Auth   | Description          |
|--------|-----------------------|--------|----------------------|
| POST   | `/subscribe`          | Public | Subscribe email      |
| GET    | `/unsubscribe/:token` | Public | Unsubscribe via link |

**Subscribe body:**
```json
{ "email": "jane@example.com", "firstName": "Jane" }
```

---

### 📅 Bookings  `/api/v1/bookings`

| Method | Endpoint    | Auth      | Description                  |
|--------|-------------|-----------|------------------------------|
| POST   | `/`         | Optional  | Create booking (rate: 5/hr)  |
| GET    | `/my`       | 🔒 User   | Own bookings                 |
| GET    | `/ref/:ref` | Public    | Lookup by reference code     |

**Create booking body:**
```json
{
  "firstName": "Jane", "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+256700000000",
  "sessionType": "deep-dive",
  "concern": "weight-loss",
  "notes": "I have been struggling with..."
}
```

**sessionType values:** `quick-consult` | `deep-dive` | `3-month-journey`

**concern values:** `weight-loss` | `testosterone` | `premature-ejaculation` | `pcos` | `pregnancy` | `mental-health` | `general-wellness` | `multiple`

---

### 📝 Blog  `/api/v1/blog`

| Method | Endpoint      | Auth       | Description              |
|--------|---------------|------------|--------------------------|
| GET    | `/`           | Public     | List published posts     |
| GET    | `/:slug`      | Optional   | Get post (+ views++)     |
| POST   | `/`           | 🔒 Admin   | Create post              |
| PATCH  | `/:id`        | 🔒 Admin   | Update post              |
| DELETE | `/:id`        | 🔒 Admin   | Delete post              |
| POST   | `/:id/cover`  | 🔒 Admin   | Upload cover image       |

**Query params for GET /:**
- `page`, `limit` — pagination
- `topic` — filter by topic slug
- `category` — filter by category
- `featured=true` — featured only
- `status` — `published` (default) | `draft` (admin only)

---

### 🛡️ Admin  `/api/v1/admin`  *(Admin role required)*

| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| GET    | `/dashboard`              | Stats, charts, recent activity   |
| GET    | `/users`                  | All users (paginated, searchable)|
| GET    | `/users/:id`              | Single user                      |
| PATCH  | `/users/:id`              | Update user role / status        |
| DELETE | `/users/:id`              | Delete user                      |
| GET    | `/contacts`               | All contact submissions          |
| PATCH  | `/contacts/:id`           | Update status / add note         |
| DELETE | `/contacts/:id`           | Delete contact                   |
| GET    | `/bookings`               | All bookings (filterable)        |
| PATCH  | `/bookings/:id`           | Update status / schedule         |
| DELETE | `/bookings/:id`           | Delete booking                   |
| GET    | `/newsletter`             | All subscribers                  |
| DELETE | `/newsletter/:id`         | Remove subscriber                |
| GET    | `/blog`                   | All posts (all statuses)         |

**Dashboard response includes:**
```json
{
  "stats": {
    "users":      { "total": 120, "thisMonth": 14, "growth": 16.7 },
    "bookings":   { "total": 48, "pending": 5, "thisMonth": 12 },
    "contacts":   { "total": 33, "unread": 7 },
    "newsletter": { "total": 340, "active": 318 },
    "blog":       { "total": 12, "published": 10 }
  },
  "charts": {
    "bookingsByStatus": [...],
    "bookingsByConcern": [...]
  },
  "recent": { "bookings": [...], "contacts": [...] }
}
```

---

### ❤️ Health Check

```
GET /health
```
```json
{
  "success": true, "status": "healthy",
  "env": "production", "uptime": "3600s",
  "timestamp": "2026-03-25T12:00:00.000Z"
}
```

---

## Error Response Format

All errors follow this shape:
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Email is required. Password must be at least 8 characters."
}
```

| Code | Meaning                        |
|------|-------------------------------|
| 400  | Bad request / invalid input   |
| 401  | Not authenticated             |
| 403  | Forbidden (wrong role)        |
| 404  | Not found                     |
| 409  | Conflict (duplicate)          |
| 422  | Validation error              |
| 429  | Rate limit exceeded           |
| 500  | Internal server error         |

---

## Deployment to Railway

1. Push code to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Connect your GitHub repo
4. Add MongoDB plugin (or use MongoDB Atlas)
5. Set all environment variables from `.env.example`
6. Railway auto-detects `Procfile` and deploys

**Or deploy to Render:**
1. New Web Service → connect GitHub repo
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add all environment variables

---

## Security Features

- ✅ JWT with httpOnly cookies
- ✅ Bcrypt password hashing (cost factor 12)
- ✅ MongoDB injection prevention
- ✅ XSS sanitization
- ✅ HTTP parameter pollution protection
- ✅ Security headers (Helmet)
- ✅ CORS whitelist
- ✅ Rate limiting (global + per route)
- ✅ Request size limits (10kb JSON)
- ✅ File type/size validation
- ✅ Input validation on all endpoints
- ✅ Email enumeration prevention (forgot password)

---

## Connecting the Frontend

In your frontend `js/global.js`, add:

```javascript
const API_BASE = 'https://your-api.railway.app/api/v1';

async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',   // sends cookies
    ...options
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}
```

**Example — submit contact form:**
```javascript
await apiCall('/contact', {
  method: 'POST',
  body: JSON.stringify({ firstName, lastName, email, subject, message })
});
```

**Example — subscribe to newsletter:**
```javascript
await apiCall('/newsletter/subscribe', {
  method: 'POST',
  body: JSON.stringify({ email })
});
```

**Example — create booking:**
```javascript
await apiCall('/bookings', {
  method: 'POST',
  body: JSON.stringify({ firstName, lastName, email, sessionType, concern, notes })
});
```
