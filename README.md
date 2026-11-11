# DamJachai (দাম যাচাই)

**"Check the price"**: compare the price and quality signals of diagnostic tests (blood tests, X-ray, ultrasound, MRI, CT and more) across diagnostic labs in Bangladeshi cities.

> DamJachai does not give medical advice. Prices can change, so always confirm with the lab.
> All seed data in this repository is **fake sample data** (for example "Sample Lab 1").

## Tech stack

| Part     | Tools |
|----------|-------|
| Frontend | React 19 + Vite 6, React Router, Axios, TanStack Query, Tailwind CSS 3, react-i18next (Bangla / English) |
| Backend  | Node.js 20, Express 5, zod, helmet, cors, morgan, dotenv |
| Database | PostgreSQL with `pg` and plain SQL migrations (from Phase 1) |
| Auth     | JWT access + refresh tokens, bcrypt (from Phase 2) |

## Project structure

```
DamJachai/
├── client/                 React + Vite app
│   ├── public/
│   └── src/
│       ├── components/     reusable UI (Logo, LanguageToggle, ...)
│       ├── i18n/           i18next setup
│       ├── lib/            axios instance, query client, API helpers
│       ├── locales/        bn.json, en.json
│       ├── pages/
│       ├── providers/      app-wide providers (TanStack Query, ...)
│       └── routes/         React Router config
├── server/                 Express API
│   └── src/
│       ├── config/         env loading + validation
│       ├── controllers/
│       ├── db/
│       │   ├── migrations/ numbered .sql files
│       │   └── seeds/
│       ├── middleware/     error handler, 404, auth (later)
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/     zod schemas
│       ├── app.js          builds the Express app
│       └── server.js       starts the HTTP server
└── package.json            npm workspaces + scripts to run both apps
```

## Requirements

- Node.js **20+** and npm 10+
- PostgreSQL 14+ (needed from Phase 1)
- Git

## Setup

```bash
# 1. Install dependencies for both apps (npm workspaces)
npm install

# 2. Create local env files from the examples
cp server/.env.example server/.env
cp client/.env.example client/.env
#    then edit server/.env: set DATABASE_URL and long random JWT secrets

# 3. Run the API and the web app together
npm run dev
```

- Web app: http://localhost:5173
- API health check: http://localhost:5000/api/health

### Scripts (run from the repo root)

| Command              | What it does |
|----------------------|--------------|
| `npm run dev`        | Runs server (`node --watch`) and client (Vite) together |
| `npm run dev:server` | API only |
| `npm run dev:client` | Web app only |
| `npm run build`      | Production build of the client into `client/dist` |
| `npm start`          | Starts the API without the file watcher |

### Environment variables

**server/.env**

| Name                 | Example | Notes |
|----------------------|---------|-------|
| `PORT`               | `5000` | API port |
| `DATABASE_URL`       | `postgres://postgres:postgres@localhost:5432/damjachai` | used from Phase 1 |
| `JWT_ACCESS_SECRET`  | long random string | used from Phase 2 |
| `JWT_REFRESH_SECRET` | long random string | used from Phase 2 |
| `CLIENT_URL`         | `http://localhost:5173` | the only origin CORS allows |

**client/.env**

| Name           | Example |
|----------------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` |

## Git workflow (local only)

- This project uses Git **for local version control only**. A local `.git/hooks/pre-push` hook blocks every push.
  Hooks are not versioned, so after a fresh clone recreate it:

  ```bash
  printf '#!/bin/sh\necho "Pushing is disabled for this project"\nexit 1\n' > .git/hooks/pre-push
  chmod +x .git/hooks/pre-push
  ```

- `main` holds stable work. Each phase is built on its own branch `phase-<n>-<name>`, merged with `git merge --no-ff`, and tagged `v0.<n>.0`.
- Commit messages follow `type(scope): message`, for example `feat(api): add test search endpoint`.
- Never commit `.env`, `node_modules`, uploads or build folders (already covered by `.gitignore`).
