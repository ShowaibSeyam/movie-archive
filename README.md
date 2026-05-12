# 🎬 Movie Archive

A full-stack IMDb-style web application built with **Node.js + Express + MySQL + Vanilla JS**.

---

## 📁 Project Structure

```
movie-archive/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Profile
│   │   ├── movieController.js     # Movie CRUD + search/filter
│   │   ├── reviewController.js    # Review CRUD
│   │   └── metaController.js      # Genres, Directors, Actors, Watchlist, Admin
│   ├── middleware/
│   │   └── auth.js                # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── movies.js              # /api/movies/*
│   │   └── api.js                 # All other routes
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── frontend/
│   ├── css/
│   │   ├── main.css               # Variables, reset, navbar, cards, layout
│   │   └── pages.css              # Hero, detail, reviews, admin, modals
│   ├── js/
│   │   ├── app.js                 # State, API helper, auth, router, theme
│   │   ├── movies.js              # Home, movies page, genres, watchlist, search
│   │   ├── detail.js              # Movie detail + reviews + star rating
│   │   ├── profile.js             # User profile + password change
│   │   └── admin.js               # Admin panel (movies/genres/directors/actors/users)
│   └── index.html                 # Main SPA shell
│
└── database/
    ├── schema.sql                 # CREATE TABLE + triggers
    └── seed.sql                   # Sample data (INSERT)
```

---

## ⚙️ Prerequisites

| Tool    | Version  |
|---------|----------|
| Node.js | v18+     |
| npm     | v9+      |
| MySQL   | 8.0+     |

---

## 🚀 Setup Instructions

### Step 1 — Database

```bash
# Open MySQL and run both SQL files:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env → set DB_PASSWORD and JWT_SECRET
npm install
npm run dev        # starts on http://localhost:5000
```

### Step 3 — Frontend

Open `frontend/index.html` directly in your browser, **or** serve it:

```bash
# Option A: VS Code Live Server (recommended)
# Right-click index.html → Open with Live Server

# Option B: Python
cd frontend && python3 -m http.server 3000
# then open http://localhost:3000
```

> ⚠️ The frontend connects to `http://localhost:5000/api` by default.
> Change `const API = '...'` in `frontend/js/app.js` if your backend runs on a different port.

---

## 🔐 Default Login Credentials

| Role  | Email                      | Password     |
|-------|----------------------------|--------------|
| Admin | admin@moviearchive.com     | Admin@1234   |
| User  | alice@example.com          | Test@1234    |
| User  | bob@example.com            | Test@1234    |

---

## 📡 API Endpoints

### Auth  `/api/auth`
| Method | Path        | Auth     | Description         |
|--------|-------------|----------|---------------------|
| POST   | /register   | Public   | Create account      |
| POST   | /login      | Public   | Login → JWT token   |
| GET    | /me         | Required | Get current user    |
| PUT    | /profile    | Required | Update name/avatar  |
| PUT    | /password   | Required | Change password     |

### Movies  `/api/movies`
| Method | Path              | Auth   | Description                  |
|--------|-------------------|--------|------------------------------|
| GET    | /                 | Public | List (search/filter/paginate)|
| GET    | /featured         | Public | Top 6 rated movies           |
| GET    | /:id              | Public | Movie detail + cast + reviews|
| POST   | /                 | Admin  | Create movie                 |
| PUT    | /:id              | Admin  | Update movie                 |
| DELETE | /:id              | Admin  | Delete movie                 |

### Reviews  `/api`
| Method | Path                         | Auth     | Description      |
|--------|------------------------------|----------|------------------|
| GET    | /movies/:id/reviews          | Public   | List reviews     |
| POST   | /movies/:id/reviews          | Required | Add review       |
| PUT    | /reviews/:id                 | Required | Edit own review  |
| DELETE | /reviews/:id                 | Required | Delete review    |

### Watchlist  `/api`
| Method | Path                    | Auth     | Description          |
|--------|-------------------------|----------|----------------------|
| GET    | /watchlist              | Required | Get my watchlist     |
| POST   | /watchlist/:movie_id    | Required | Add to watchlist     |
| DELETE | /watchlist/:movie_id    | Required | Remove from watchlist|

### Metadata  `/api`
| Method | Path              | Auth   | Description         |
|--------|-------------------|--------|---------------------|
| GET    | /genres           | Public | List genres         |
| POST   | /genres           | Admin  | Create genre        |
| DELETE | /genres/:id       | Admin  | Delete genre        |
| GET    | /directors        | Public | List directors      |
| POST   | /directors        | Admin  | Create director     |
| PUT    | /directors/:id    | Admin  | Update director     |
| DELETE | /directors/:id    | Admin  | Delete director     |
| GET    | /actors           | Public | List actors         |
| POST   | /actors           | Admin  | Create actor        |
| PUT    | /actors/:id       | Admin  | Update actor        |
| DELETE | /actors/:id       | Admin  | Delete actor        |

### Admin Users  `/api/admin`
| Method | Path              | Auth  | Description      |
|--------|-------------------|-------|------------------|
| GET    | /users            | Admin | List all users   |
| DELETE | /users/:id        | Admin | Delete user      |
| PUT    | /users/:id/role   | Admin | Change user role |

---

## ✅ Features

### User
- Register / Login / Logout
- JWT-based session (persists on refresh)
- Edit profile name & avatar
- Change password
- Browse & search movies (title/director)
- Filter by genre, year; sort by rating/year/name
- View movie detail (cast, director, description)
- Add / Edit / Delete own reviews with ⭐ 1–10 star rating
- Add / Remove movies from personal watchlist

### Admin
- Add / Edit / Delete movies
- Manage genres, directors, actors
- View and manage all users (role promotion, deletion)

### UI
- Cinematic dark/light theme toggle
- Fully responsive (mobile friendly)
- Live search overlay
- Pagination
- Toast notifications
- Star rating UI (1–10)
- Movie poster with gradient fallback

---

## 🔒 Security

- **bcryptjs** password hashing (12 rounds)
- **JWT** tokens with expiry
- **Helmet.js** HTTP security headers
- **CORS** restricted to allowed origins
- **express-rate-limit** on all routes (strict on auth)
- **Parameterised SQL queries** — no SQL injection possible
- Role-based access control (user / admin)
