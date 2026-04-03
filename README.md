# 📚 Community Library API

A RESTful API for community library management — built with Node.js, Express, and PostgreSQL.

## 💡 About This Project

Started as a guided course project using SQLite. I challenged myself to go further: migrated to PostgreSQL, rebuilt the architecture using the MSC pattern (Model/Repository – Service – Controller), and added production-grade security features.

**Key decisions:**

- **SQLite → PostgreSQL** — for scalability and real-world relevance
- **MSC Architecture** — clean separation of concerns, built to scale
- **Security** — bcrypt password hashing, JWT authentication, Timing Attack prevention, and centralized error handling (`AppError`)

## 🛠️ Tech Stack

| Layer        | Technology               |
| ------------ | ------------------------ |
| Runtime      | Node.js + Express        |
| Database     | PostgreSQL (`pg` driver) |
| Security     | Bcrypt + JWT             |
| Validation   | Zod                      |
| DevOps       | Docker Compose           |
| Config       | Dotenv                   |

## ⚙️ Current Features

- `POST /users` — Account creation with input validation
- `POST /auth/login` — JWT authentication with Timing Attack prevention
- `GET /users` — List all users *(protected route)*
- `GET /users/:id` — Find user by ID *(protected route)*
- `PATCH /users/:id` — Partial user update *(protected route)*
- `DELETE /users/:id` — Delete user *(protected route)*
- Unique email enforcement
- Password hashing on registration
- Unified error handling via custom `AppError` class

## 🚀 Getting Started

**Prerequisites:** Node.js, PostgreSQL (local or via Docker)
```bash
git clone <repo-url>
cd community_library
npm install
```

Create a `.env` file in the root:
```env
DB_USER=your_user
DB_HOST=localhost
DB_DATABASE=community_library
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_long_random_secret_here
```

**Option A — Docker (recommended):**
```bash
docker-compose up -d
npm run dev
```

**Option B — Local PostgreSQL:**
Create a `community_library` database, configure `.env`, then `npm run dev`.

Server runs at `http://localhost:3000`.

## 🔜 Roadmap

See `NEXT_STEPS.md` — includes ORM integration and automated testing.
