# FormFlow

FormFlow is a full-stack web app for building interactive forms, embedding them on any website as a floating chatbot widget, and managing responses from a dashboard.

Built as the Software Engineer Intern project for Tynoc Tech.

> **Status:** in progress, built in nine daily stages. See [Roadmap](#roadmap).

## Tech stack

| Layer    | Choice                                         |
| -------- | ---------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript        |
| UI       | Tailwind CSS                                   |
| Backend  | Next.js Server Actions and route handlers      |
| Database | PostgreSQL (hosted on Supabase) via Prisma ORM |
| Auth     | Email and password (bcrypt), database sessions |
| CI       | GitHub Actions (lint, type-check, build)       |

## Roadmap

- [x] **Day 1 – Project setup:** Next.js app, tooling, CI, README
- [x] **Day 2 – Database and security:** Supabase Postgres, Prisma schema, row level security, sign-up and login
- [ ] **Day 3 – Dashboard:** stats, create, edit and delete forms
- [ ] **Day 4 – Form builder:** question types, required fields, reordering, preview
- [ ] **Day 5 – Chat experience:** one-question-at-a-time conversational UI with validation
- [ ] **Day 6 – Publishing and responses:** public URLs, saved submissions, submissions view
- [ ] **Day 7 – Website embed:** floating widget and JavaScript embed snippet
- [ ] **Day 8 – Landing page and polish:** marketing page, responsive design
- [ ] **Day 9 – Testing and deployment:** end-to-end checks, deployed demo

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or newer (24 LTS recommended; see `.nvmrc`)
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) project (or any PostgreSQL database)

### Run locally

```bash
git clone <this-repo-url>
cd formflow
npm install
cp .env.example .env   # on Windows PowerShell: Copy-Item .env.example .env
```

Fill in `DATABASE_URL` and `DIRECT_URL` in `.env` (Supabase: **Connect → ORMs → Prisma**), then create the tables and start the app:

```bash
npm run db:deploy
npm run dev
```

Open <http://localhost:3000> and sign up.

### Environment variables

Settings live in a `.env` file, which is git-ignored and never committed. `.env.example` lists every variable the app needs, with placeholder values.

| Variable              | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public base URL, used for share links and the embed code |
| `DATABASE_URL`        | Pooled Postgres connection (port 6543), used by the app  |
| `DIRECT_URL`          | Session Postgres connection (port 5432), for migrations  |

### Scripts

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the development server                 |
| `npm run build`      | Create a production build                    |
| `npm start`          | Run the production build                     |
| `npm run lint`       | Lint with ESLint                             |
| `npm run typecheck`  | Generate route types and run `tsc`           |
| `npm run db:migrate` | Create and apply a migration (development)   |
| `npm run db:deploy`  | Apply existing migrations (setup/production) |
| `npm run db:studio`  | Browse the database in Prisma Studio         |

## Security notes

- Passwords are hashed with bcrypt (cost 12); plain passwords are never stored.
- Sessions use a random 256-bit token in an `httpOnly`, `sameSite=lax` cookie (`secure` in production). Only a SHA-256 hash of the token is stored in the database.
- All input is validated on the server with zod, in addition to browser validation.
- Login errors don't reveal whether an email is registered.
- Row level security is enabled on every table, so Supabase's auto-generated Data API can't read or write them. The app connects as the table owner through Prisma.

## Project structure

```
app/                # Pages, layouts and Server Actions (App Router)
  actions/          # Server Actions (sign up, log in, log out)
  dashboard/        # Logged-in area
  login/, signup/   # Auth pages
components/         # Shared React components
lib/                # Server-side helpers: database client, sessions, validation
prisma/             # Database schema and migrations
.github/workflows/  # CI pipeline (lint, type-check, build on every push)
.vscode/            # Recommended editor settings and extensions
```