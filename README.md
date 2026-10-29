# FormFlow

FormFlow is a full-stack web app for building interactive forms, embedding them on any website as a floating chatbot widget, and managing every response from one dashboard.

Built as the Software Engineer Intern project for Tynoc Tech.

**Live demo:** https://YOUR-APP.vercel.app

## Features

### Landing page
- Hero, features, how it works, a live chat demo and a footer with navigation and contact links
- A floating chat widget demo in the corner, exactly as visitors would see it on a customer's website
- Fully responsive

### Accounts
- Sign up, log in and log out with email and password
- Each user only ever sees and edits their own forms

### Dashboard
- Total forms and total responses at a glance
- Create, edit, rename, delete, publish and unpublish forms
- Status badge (Draft / Published), question and response counts per form

### Form builder
- Question types: **text**, **email**, **multiple choice** and **yes/no**
- Edit question text and options, reorder with up/down buttons, delete, mark as required or optional
- Widget customisation: colour, welcome message and completion message
- **Live preview** of the chat that updates as you edit
- Server-side validation with clear messages, and a warning before leaving with unsaved changes

### Chatbot widget
- Questions appear one at a time in a chat-style interface
- Text input for text and email questions, answer buttons for multiple choice and yes/no
- Validation (required answers, email format, valid options) with a **Skip** button for optional questions
- Welcome and completion messages, the form's own colour
- **Floating widget for any website** via a one-line JavaScript snippet; full-screen on phones

### Responses and publishing
- A unique, unguessable public URL for every form (`/f/<slug>`)
- Publish / unpublish; unpublished forms stop accepting responses
- Responses saved to PostgreSQL after being validated again on the server
- Submissions view with every answer and its timestamp (shown in the viewer's time zone)
- Old responses stay readable after the form is edited: each answer keeps a copy of the question text

## Try the full flow (completion criteria)

1. **Sign up** on the live demo and click **+ New form**, then **Edit**.
2. **Build the form:** add a few questions (try all four types), set a colour and messages, and check the **Preview**. Click **Save changes**.
3. **Publish** it. The Publishing box now shows the form's public link and the embed snippet.
4. **Embed it on a test website:** click **Try it on a test website**. A sample bakery site opens with the floating chat button in the corner. Answer the form there (also try it at phone width).
5. Optionally, open the **public link** in a private window and answer it there too.
6. Back in the dashboard, open **Responses** to see each submission with its timestamp.

To embed on any other site, paste the snippet from the editor before `</body>`:

```html
<script src="https://YOUR-APP.vercel.app/embed.js" data-form="FORM_SLUG" data-color="#dc2626" async></script>
```

## Tech stack

| Layer      | Choice                                                   |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript            |
| UI         | Tailwind CSS 4                                           |
| Backend    | Next.js Server Actions                                   |
| Database   | PostgreSQL on Supabase, via Prisma ORM 6                 |
| Validation | zod (shared rules for browser and server)                |
| Auth       | Email and password (bcrypt), database-backed sessions    |
| Hosting    | Vercel                                                   |
| CI         | GitHub Actions: lint, type-check and build on every push |

## How it works

```
Owner ──► Form builder ──saves──► Form + Questions ──read by──► Public page / Widget ◄── Visitors
                                    (PostgreSQL)                        │
Owner ◄── Submissions view ◄──reads── Responses + Answers ◄──saves──────┘
```

- **One chat component, four places.** `components/chat-form.tsx` powers the landing page demo, the builder preview, the public form page and the embedded widget, so all of them behave the same.
- **The embed script** (`public/embed.js`) is plain JavaScript. It adds a round button to the host page and, when clicked, opens the form's public page (`/f/<slug>?embed=1`) inside an iframe. The iframe keeps the host site's CSS and scripts separate from the widget, and saving answers works exactly like on the public page.
- **Data model** (`prisma/schema.prisma`): `User` → `Session`, `User` → `Form` → `Question`, and `Form` → `Response` → `Answer`. Deleting a form cascades to its questions and responses.

## Security

- Passwords are hashed with bcrypt (cost 12); plain passwords are never stored.
- Sessions use a random 256-bit token in an `httpOnly`, `sameSite=lax` cookie (`secure` in production). Only a SHA-256 hash of the token is stored in the database.
- Every Server Action checks the session itself, and every query for forms includes the owner's ID, so users can't read or change each other's forms.
- All input is validated on the server with zod, in addition to the browser. Submitted answers are checked against the form's real questions (required, email format, allowed options, length).
- Login errors don't reveal whether an email is registered, and take the same time either way.
- Row level security is enabled on every table, so Supabase's auto-generated Data API can't read or write them. The app connects as the table owner through Prisma.
- The embed script validates its colour attribute, only accepts close messages from its own iframe, and styles its buttons inline so the host page's CSS can't restyle them.

## Run locally

### Prerequisites
- [Node.js](https://nodejs.org/) 20.9 or newer (24 LTS recommended; see `.nvmrc`)
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com/) project (or any PostgreSQL database)

### Setup

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

`.env` is git-ignored and never committed. `.env.example` lists every variable with placeholder values.

| Variable       | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `DATABASE_URL` | Pooled Postgres connection (port 6543), used by the app |
| `DIRECT_URL`   | Session Postgres connection (port 5432), for migrations |

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

## Deployment (Vercel)

1. Import the GitHub repository in Vercel (framework: Next.js).
2. Set the **Build Command** to `npm run db:deploy && npm run build`, so pending migrations run before each build.
3. Add `DATABASE_URL` and `DIRECT_URL` as environment variables.
4. Set the function region close to the database (here: Dublin, `dub1`).

Every push to `main` deploys automatically.

## Project structure

```
app/
  page.tsx                          # Landing page
  login/, signup/                   # Auth pages
  dashboard/                        # Logged-in area (layout with top bar)
    page.tsx                        # Forms list and totals
    forms/[formId]/page.tsx         # Form builder
    forms/[formId]/responses/       # Submissions view
  f/[slug]/page.tsx                 # Public form page (?embed=1 for the widget)
  actions/                          # Server Actions: auth, forms, responses
components/                         # Chat, builder, publishing panel, widget demo, etc.
lib/                                # Database client, sessions, validation rules
prisma/                             # Schema and migrations
public/embed.js                     # Embed script for external websites
public/embed-test.html              # Sample website for testing the widget
.github/workflows/ci.yml            # CI pipeline
```

## Roadmap

- [x] **Day 1 – Project setup:** Next.js app, tooling, CI, README
- [x] **Day 2 – Database and security:** Supabase Postgres, Prisma schema, row level security, sign-up and login
- [x] **Day 3 – Dashboard:** stats, create, rename and delete forms
- [x] **Day 4 – Form builder:** question types, required fields, reordering, live preview
- [x] **Day 5 – Chat experience:** one-question-at-a-time chat with validation
- [x] **Day 6 – Publishing and responses:** public URLs, saved submissions, submissions view
- [x] **Day 7 – Website embed:** floating widget, JavaScript snippet, test website
- [x] **Day 8 – Landing page and polish:** landing page, brand theme, widget demo, mobile checks
- [x] **Day 9 – Testing and deployment:** end-to-end testing, Vercel deployment

## Possible next steps

- Export responses to CSV
- Per-question answer summaries and charts
- Duplicate forms, form templates
- Rate limiting on public submissions
- Automated end-to-end tests (e.g. Playwright) in CI