# FormFlow

FormFlow is a full-stack web app for building interactive forms, embedding them on any website as a floating chatbot widget, and managing responses from a dashboard.

Built as the Software Engineer Intern project for Tynoc Tech.

> **Status:** in progress, built in nine daily stages. See [Roadmap](#roadmap).

## Tech stack

| Layer    | Choice                                         |
| -------- | ---------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript        |
| UI       | Tailwind CSS                                   |
| Backend  | Next.js route handlers and server actions      |
| Database | PostgreSQL (hosted on Supabase) via Prisma ORM |
| Auth     | Email and password, hashed, with DB sessions   |
| CI       | GitHub Actions (lint, type-check, build)       |

## Roadmap

- [x] **Day 1 – Project setup:** Next.js app, tooling, CI, README
- [ ] **Day 2 – Database and security:** Supabase Postgres, Prisma schema, sign-up and login
- [ ] **Day 3 – Dashboard:** stats, create, edit and delete forms
- [ ] **Day 4 – Form builder:** question types, required fields, reordering, preview
- [ ] **Day 5 – Chat experience:** one-question-at-a-time conversational UI with validation
- [ ] **Day 6 – Publishing and responses:** public URLs, saved submissions, submissions view
- [ ] **Day 7 – Website embed:** floating widget and JavaScript embed snippet
- [ ] **Day 8 – Landing page and polish:** marketing page, responsive design
- [ ] **Day 9 – Testing and deployment:** end-to-end checks, deployed demo

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or newer (22 LTS recommended; see `.nvmrc`)
- [Git](https://git-scm.com/)

### Run locally

```bash
git clone <this-repo-url>
cd formflow
npm install
cp .env.example .env   # on Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Then open <http://localhost:3000>.

### Environment variables

Settings live in a `.env` file, which is git-ignored and never committed. `.env.example` lists every variable the app needs, with placeholder values.

### Scripts

| Command             | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the development server       |
| `npm run build`     | Create a production build          |
| `npm start`         | Run the production build           |
| `npm run lint`      | Lint with ESLint                   |
| `npm run typecheck` | Generate route types and run `tsc` |

## Project structure

```
src/
  app/              # Next.js App Router pages, layouts and route handlers
.github/workflows/  # CI pipeline (lint, type-check, build on every push)
.vscode/            # Recommended editor settings and extensions
```