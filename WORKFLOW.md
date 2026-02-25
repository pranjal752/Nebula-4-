# Nebula — Project Workflow

A full-stack competitive programming platform. Users browse problems, write code in the browser, submit solutions that are judged against hidden test cases, and compete on a live leaderboard.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Authentication Flow](#authentication-flow)
5. [Submission & Judging Flow](#submission--judging-flow)
6. [Frontend Routing](#frontend-routing)
7. [Backend API Routes](#backend-api-routes)
8. [Data Models](#data-models)
9. [Real-Time (Socket.IO)](#real-time-socketio)
10. [State Management](#state-management)
11. [Deployment](#deployment)
12. [Local Development](#local-development)
13. [Seed Data](#seed-data)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│   React 18 + Vite   →   Vercel (nebula-4-eight.vercel)  │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS  (REST + Socket.IO)
┌────────────────────────▼────────────────────────────────┐
│              Express.js API  →  Render                  │
│       (nebula-4-b60l.onrender.com/api)                  │
└──────┬─────────────────┬───────────────────────────────┘
       │                 │
  MongoDB Atlas    Judge0 CE (public)
  (database)       (code execution)
```

---

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Frontend      | React 18, Vite, Tailwind CSS v3                 |
| Routing       | React Router v6                                 |
| State         | React Context (AuthContext)                     |
| HTTP Client   | Axios (with interceptors)                       |
| Code Editor   | Monaco Editor                                   |
| Animations    | Framer Motion                                   |
| Notifications | react-hot-toast                                 |
| Backend       | Express.js (ES Modules)                         |
| Database      | MongoDB Atlas + Mongoose                        |
| Auth          | JWT (access + refresh tokens), httpOnly cookies |
| Code Judge    | Judge0 CE (external API)                        |
| Real-Time     | Socket.IO                                       |
| Security      | Helmet, CORS, express-rate-limit                |
| Logging       | Morgan                                          |
| Hosting       | Render (backend) + Vercel (frontend)            |

---

## Repository Structure

```
Nebula/
├── backend/
│   └── src/
│       ├── index.js              # App entry — middleware, routes, Socket.IO, startup validation
│       ├── seed.js               # DB seeder (problems + admin/test users)
│       ├── config/
│       │   ├── db.js             # Mongoose connection
│       │   └── constants.js      # Language map, verdict enums, Judge0 status codes
│       ├── controllers/          # Business logic per domain
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── problem.controller.js
│       │   ├── submission.controller.js
│       │   ├── contest.controller.js
│       │   ├── leaderboard.controller.js
│       │   └── analytics.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js       # JWT Bearer token verification
│       │   ├── admin.middleware.js      # Role guard (admin only)
│       │   └── rateLimiter.middleware.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Problem.js
│       │   ├── Submission.js
│       │   └── Contest.js
│       ├── routes/               # Express routers (one per domain)
│       ├── services/
│       │   └── judge.service.js  # Judge0 API integration
│       └── utils/
│           ├── response.js       # sendSuccess / sendError helpers
│           └── tokenUtils.js     # JWT sign/verify + cookie options
│
└── frontend/
    └── src/
        ├── main.jsx              # React root
        ├── App.jsx               # Router + lazy-loaded pages + ProtectedRoute
        ├── api/
        │   └── axios.js          # Axios instance (baseURL, interceptors)
        ├── context/
        │   └── AuthContext.jsx   # Global auth state (user, login, register, logout)
        ├── layouts/
        │   └── Layout.jsx        # Navbar + <Outlet />
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── Button.jsx
        │   ├── Card.jsx
        │   └── Input.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Problems.jsx
            ├── ProblemDetail.jsx   # Monaco editor + judge results
            ├── Leaderboard.jsx
            ├── Contests.jsx
            ├── Submissions.jsx
            └── NotFound.jsx
```

---

## Authentication Flow

```
User fills Login form
        │
        ▼
POST /api/auth/login
  { email, password }
        │
        ▼
auth.controller.js
  1. Find user by email
  2. bcrypt.compare(password, user.passwordHash)
  3. generateAccessToken(user)   → signed JWT (15min)
  4. generateRefreshToken(user)  → signed JWT (7d)
  5. Set refreshToken httpOnly cookie
  6. Return { success, data: { user, accessToken } }
        │
        ▼
AuthContext.jsx (frontend)
  1. Store accessToken in localStorage('token')
  2. Store user object in localStorage('user')
  3. setUser(user) → component tree re-renders
  4. Navigate to /dashboard
        │
        ▼
All subsequent API calls (axios interceptor):
  headers: { Authorization: "Bearer <accessToken>" }
        │
        ▼
auth.middleware.js
  1. Extract Bearer token from header
  2. jwt.verify(token, JWT_SECRET)
  3. Attach req.user = decoded payload
  4. next()

── Session Restore on page load ──────────────────────────
App mount → AuthContext.checkAuth()
  → GET /api/auth/me
  → If 401/403: clear localStorage (invalid token)
  → If network error (Render cold start): restore from localStorage('user')
  → setUser(result)

── Token Refresh ──────────────────────────────────────────
POST /api/auth/refresh
  → reads refreshToken from httpOnly cookie
  → issues new accessToken

── Logout ────────────────────────────────────────────────
POST /api/auth/logout
  → clears refreshToken cookie
  → frontend clears localStorage, setUser(null) → /login
```

---

## Submission & Judging Flow

```
User writes code in Monaco Editor (ProblemDetail page)
        │
        ▼
Click "Submit Solution"
        │
        ▼
POST /api/submissions
  { problemId, code, language }
  Authorization: Bearer <token>
        │
        ▼
submission.controller.js
  1. Create Submission doc { verdict: "Pending" }
  2. Emit socket event: submission:<id> → "Running"
  3. Call judge.service.runAllTestCases()
        │
        ▼
judge.service.js  ──→  Judge0 CE API
  For each test case:
    POST /submissions   (base64 encoded code + stdin)
    return token
  Poll all tokens until status != "Processing"
  Compare actual output vs expected output
        │
        ▼
Determine final verdict:
  All pass  → "Accepted"
  Any fail  → "Wrong Answer" / "TLE" / "MLE" / "RE" / "CE"
        │
        ▼
Update Submission.verdict in MongoDB
Update User.stats (solved count, rating)
Emit socket event: submission:<id> → { verdict, testResults }
        │
        ▼
Frontend (Socket.IO listener in ProblemDetail)
  Receives real-time verdict update
  Shows per-test-case results (pass/fail, runtime, memory)
```

---

## Frontend Routing

| Path             | Page                          | Auth Required             |
| ---------------- | ----------------------------- | ------------------------- |
| `/`              | Home                          | No                        |
| `/login`         | Login                         | No                        |
| `/register`      | Register                      | No                        |
| `/problems`      | Problems list (filter/search) | No                        |
| `/problem/:slug` | Problem Detail + Editor       | No (submit requires auth) |
| `/leaderboard`   | Global leaderboard            | No                        |
| `/contests`      | Contests list                 | No                        |
| `/dashboard`     | User dashboard + stats        | **Yes**                   |
| `/submissions`   | User submission history       | **Yes**                   |
| `*`              | 404 NotFound                  | No                        |

All pages are **lazy-loaded** via `React.lazy()` for code-splitting. Unauthenticated access to protected routes redirects to `/login`.

---

## Backend API Routes

### Auth — `/api/auth`

| Method | Path        | Description                              |
| ------ | ----------- | ---------------------------------------- |
| POST   | `/register` | Create account                           |
| POST   | `/login`    | Login, returns accessToken + sets cookie |
| POST   | `/logout`   | Clear refresh cookie                     |
| POST   | `/refresh`  | Get new accessToken from cookie          |
| GET    | `/me`       | Get current user (requires Bearer token) |

### Problems — `/api/problems`

| Method | Path     | Description                                  |
| ------ | -------- | -------------------------------------------- |
| GET    | `/`      | List all problems (filter by difficulty/tag) |
| GET    | `/:slug` | Get single problem detail                    |
| POST   | `/`      | Create problem (admin only)                  |
| PUT    | `/:id`   | Update problem (admin only)                  |
| DELETE | `/:id`   | Delete problem (admin only)                  |

### Submissions — `/api/submissions`

| Method | Path   | Description                    |
| ------ | ------ | ------------------------------ |
| POST   | `/`    | Submit code for judging        |
| GET    | `/`    | Get current user's submissions |
| GET    | `/:id` | Get single submission detail   |

### Leaderboard — `/api/leaderboard`

| Method | Path | Description                               |
| ------ | ---- | ----------------------------------------- |
| GET    | `/`  | Global rankings (sorted by rating/solved) |

### Contests — `/api/contests`

| Method | Path   | Description                 |
| ------ | ------ | --------------------------- |
| GET    | `/`    | List all contests           |
| GET    | `/:id` | Contest details + problems  |
| POST   | `/`    | Create contest (admin only) |

### Users — `/api/users`

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/profile/:username` | Public user profile |
| PATCH  | `/me`                | Update own profile  |

### Analytics — `/api/analytics`

| Method | Path         | Description                                     |
| ------ | ------------ | ----------------------------------------------- |
| GET    | `/dashboard` | Admin analytics (submission stats, user counts) |

---

## Data Models

### User

```
_id, username, email, passwordHash, role (user|admin)
stats: { solved, attempted, totalSubmissions, rating }
createdAt, updatedAt
```

### Problem

```
_id, title, slug, problemNumber
description, difficulty (Easy|Medium|Hard), tags[]
constraints, inputFormat, outputFormat
sampleTestCases[], hiddenTestCases[]
codeTemplates: { cpp, python3, java, javascript, ... }
timeLimit (ms), memoryLimit (MB)
```

### Submission

```
_id, user (ref), problem (ref), contest (ref|null)
code, language
verdict: Pending|Running|Accepted|Wrong Answer|TLE|MLE|RE|CE
testResults[]: { testCaseIndex, input, expected, actual, verdict, runtime, memory }
runtime (ms), memory (KB)
createdAt
```

### Contest

```
_id, title, description
startTime, endTime
problems[] (ref)
participants[] (ref)
isPublic, status (upcoming|active|ended)
```

---

## Real-Time (Socket.IO)

```
Frontend connects to backend via Socket.IO on app load.

On submission:
  → frontend emits: join:submission(<submissionId>)
  → joins a private room for that submission

Backend (submission controller):
  → emits to room:  submission:<id>  with status updates
  → "Running" → per-test updates → final verdict

Frontend listener in ProblemDetail.jsx:
  → updates UI in real-time (no polling needed)
```

---

## State Management

Only one global context exists — **AuthContext**:

```jsx
const { user, loading, login, register, logout } = useAuth();
```

| Property                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `user`                   | Current user object (null if logged out)       |
| `loading`                | True during initial `checkAuth()` on mount     |
| `login(email, password)` | POST /auth/login → setUser + localStorage      |
| `register(data)`         | POST /auth/register → setUser + localStorage   |
| `logout()`               | POST /auth/logout → clear state + localStorage |

All other state (problems, submissions, leaderboard) is **local component state** fetched with `useEffect` + Axios.

---

## Deployment

### Backend — Render

**Service type:** Web Service  
**Build command:** `npm install`  
**Start command:** `node src/index.js`  
**Root directory:** `backend/`

**Required environment variables:**

| Variable             | Description                         |
| -------------------- | ----------------------------------- |
| `MONGO_URI`          | MongoDB Atlas connection string     |
| `JWT_SECRET`         | Access token signing secret         |
| `JWT_REFRESH_SECRET` | Refresh token signing secret        |
| `NODE_ENV`           | `production`                        |
| `FRONTEND_URL`       | `https://nebula-4-eight.vercel.app` |
| `PORT`               | Set automatically by Render         |
| `JUDGE0_API_URL`     | (optional) custom Judge0 instance   |

### Frontend — Vercel

**Framework preset:** Vite  
**Root directory:** `frontend/`  
**Build command:** `npm run build`  
**Output directory:** `dist/`

**Required environment variables:**

| Variable       | Value                                    |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | `https://nebula-4-b60l.onrender.com/api` |

**SPA routing fix** (`frontend/vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas URI

### Backend

```bash
cd backend
cp .env.example .env          # fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm start                      # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
# create frontend/.env
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev                    # runs on http://localhost:5173
```

### Build (production check)

```bash
cd frontend
npm run build                  # outputs to dist/
```

---

## Seed Data

Populate the database with sample problems and users:

```bash
cd backend
node src/seed.js
```

This creates:

| Account | Email            | Password   | Role  |
| ------- | ---------------- | ---------- | ----- |
| Admin   | admin@nebula.dev | Admin@1234 | admin |
| Alice   | alice@test.com   | Test@1234  | user  |
| Bob     | bob@test.com     | Test@1234  | user  |

And seeds **5 problems** spanning Easy → Hard with full test cases and code templates.

---

## Key Design Decisions

| Decision                                  | Reason                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Bearer token in localStorage (not cookie) | Simple cross-origin support; refresh token stays in httpOnly cookie for security       |
| Judge0 public CE instance                 | No API key needed for development; swap `JUDGE0_API_URL` for self-hosted in production |
| Lazy-loaded pages                         | Reduces initial bundle size; Monaco Editor is large (~2MB)                             |
| Startup env validation                    | Fail fast with a clear error if secrets are missing on Render                          |
| checkAuth only clears token on 401/403    | Render free tier cold starts cause network errors; prevents false logout               |
