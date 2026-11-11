# DamJachai (দাম যাচাই)

**"Check the price"**: compare the price and quality signals of diagnostic tests (blood tests, X-ray, ultrasound, MRI,
CT and more) across diagnostic labs in Bangladeshi cities.

> DamJachai does not give medical advice. Prices can change, so always confirm with the lab.
> All seed data in this repository is **fake sample data** ("Sample Lab 1" and so on). Nothing is scraped.

## Features

- **Search** tests in Bangla or English, or by an alias such as "CBC", "HbA1c" or "ডেঙ্গু NS1". English searches tolerate typos (`pg_trgm`).
- **Compare** every lab that offers a test. Filter by city, area, home collection, accreditation and minimum rating, and sort by price,
  rating or report time. The cheapest lab is highlighted in coral with a "Save ৳X" badge. Prices older than 90 days are
  marked, and a price history chart (Recharts) shows how each lab's price changed.
- **Basket**: add several tests and see the total at each lab, cheapest first, plus the labs that miss a test.
- **Contribute**: logged-in users report prices and write reviews. Both wait for an admin. Users can also save favorite labs.
- **Admin panel**: dashboard with charts, full create/edit/delete for labs, tests (with aliases), categories, cities, areas
  and prices, CSV import with preview, moderation queues, user management, and a filterable audit log of every admin write.
- **3D landing page** (React Three Fiber) with a scroll story, live data from the API, and fallbacks for reduced motion and weak devices.
- **Bangla and English** everywhere, with Bengali digits (৳১,২০০) in Bangla. The language choice is remembered.

## Tech stack

| Part | Tools |
|------|-------|
| Frontend | React 19 + Vite 6, React Router 7, Axios, TanStack Query 5, Tailwind CSS 3, react-i18next, Recharts 3 |
| 3D and motion | three.js, @react-three/fiber 9, @react-three/drei 10, Framer Motion 12 |
| Backend | Node.js 20, Express 5, zod 4, helmet, cors, express-rate-limit, morgan, dotenv, multer, csv-parse |
| Database | PostgreSQL 14+ with `pg` and plain numbered SQL migrations (`pg_trgm`, `citext`) |
| Auth | JWT access token (15 minutes) + rotating refresh token (7 days, httpOnly cookie, stored hashed), bcrypt |
| Tests | Jest + Supertest (API), Vitest + Testing Library (UI) |

## Project structure

```
DamJachai/
├── client/                    React app
│   ├── public/                favicon, robots.txt
│   └── src/
│       ├── components/        ui/ (Button, Input, Select, Card, Badge, Modal, Table, Pagination, Toast, ...),
│       │                      layout/ (Navbar, Footer), charts/, SearchBar, PriceTag, RatingStars, ...
│       ├── context/           AuthContext, BasketContext
│       ├── hooks/             TanStack Query hooks, URL state, page meta, ...
│       ├── i18n/ locales/     i18next setup; bn/ and en/ JSON per feature
│       ├── lib/               axios instance + refresh interceptor, API clients, formatting, device tier
│       ├── pages/             landing/ (3D scene), public/, auth/, admin/
│       ├── routes/            router and guards (RequireAuth, RequireAdmin, GuestOnly)
│       └── test/              Vitest tests
├── server/                    Express API
│   ├── src/
│   │   ├── config/            env (validated with zod), pg pool
│   │   ├── controllers/ routes/ services/ validators/ middleware/ utils/
│   │   ├── services/admin/    admin CRUD, import, moderation, dashboard, audit helper
│   │   └── db/                migrations/ (001–012 .sql), seeds/, migrate.js, create.js, reset.js
│   └── tests/                 Jest + Supertest
├── docs/                      API.md, landing-performance.md, sample-queries.sql
└── package.json               npm workspaces and scripts
```

## Requirements

- Node.js **20+** and npm 10+
- PostgreSQL **14+**, with the `pg_trgm` and `citext` extensions (both ship with PostgreSQL)

## Setup

```bash
npm install

cp server/.env.example server/.env    # then fill in DATABASE_URL, the JWT secrets and the ADMIN_* values
cp client/.env.example client/.env

npm run db:create    # creates the database named in DATABASE_URL
npm run migrate      # applies server/src/db/migrations/*.sql
npm run seed         # EMPTIES all tables, then loads fake sample data and the admin user

npm run dev          # API on http://localhost:5000, web app on http://localhost:5173
```

Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env` to open `/admin`.

Generate a JWT secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Scripts (from the repo root)

| Command | What it does |
|---------|--------------|
| `npm run dev` | API (`node --watch`) and web app (Vite) together |
| `npm run dev:server` / `npm run dev:client` | One of them only |
| `npm run build` | Production build of the client into `client/dist` |
| `npm start` | Starts the API without the file watcher |
| `npm run db:create` | Creates the database if it does not exist |
| `npm run migrate` | Applies new migrations (each in its own transaction, recorded with a checksum) |
| `npm run seed` | **Empties every table**, then loads the sample data (refuses to run when `NODE_ENV=production`) |
| `npm run db:reset` | Development only: drop everything, migrate, seed |
| `npm test` | API tests, then UI tests |
| `npm run test:server` / `npm run test:client` | One suite only |

### Environment variables

**server/.env**

| Name | Example | Notes |
|------|---------|-------|
| `NODE_ENV` | `development` | `production` hides error details and requires the JWT secrets |
| `PORT` | `5000` | |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/damjachai` | |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | 96 hex characters | at least 32 characters each |
| `ACCESS_TOKEN_TTL` | `15m` | |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | |
| `COOKIE_SAMESITE` | `lax` | use `none` (with HTTPS) if the client and API are on different sites |
| `CLIENT_URL` | `http://localhost:5173` | the only origin CORS allows |
| `TRUST_PROXY` | `0` | set to `1` behind Nginx or a load balancer |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | | the first admin, created by `npm run seed` |
| `TEST_DATABASE_URL` | optional | the tests otherwise use `<your database>_test` |

**client/.env**: `VITE_API_URL=http://localhost:5000/api`

## Database

| Table | Purpose |
|-------|---------|
| `users`, `refresh_tokens` | Accounts (`user` or `admin`). Refresh tokens are stored only as SHA-256 hashes, with rotation tracking |
| `cities`, `areas` | Locations in Bangla and English, with URL slugs |
| `labs` | Address, map position, hours, accreditation, home collection, `is_sample`, `status` (active or hidden) |
| `test_categories`, `tests`, `test_aliases` | Test catalog. Aliases power search. `search_count` ranks popular tests |
| `lab_tests` | The price of a test at a lab (unique per pair), with discount, report hours, `last_verified_at` and `source` |
| `price_history` | Old and new price, who changed it, and when |
| `reviews`, `price_reports` | User content: `pending`, `approved` or `rejected`, plus the reviewer and a note |
| `favorites` | Labs a user has saved |
| `audit_logs` | Every admin write (action, entity, id, JSON details) |

Data rules:
- Prices must be above 0, a discount can't exceed the price, and ratings run from 1 to 5.
- Slugs are checked for format.
- Labs and tests that have prices can't be hard deleted (`RESTRICT`). The admin API hides them instead.

Example queries: [docs/sample-queries.sql](docs/sample-queries.sql).

## API

See **[docs/API.md](docs/API.md)** for every endpoint, parameter and rule.

## Testing

```bash
npm test
```

- **API: 41 Jest + Supertest tests** (`server/tests`). They cover:
  - registration, login, `/me`, refresh rotation, replay detection (revokes every session), logout and deactivated accounts
  - search (alias, Bangla, typos, LIKE wildcards), compare (sorting, stats, combined filters, live DB changes), price history
  - the basket (totals, ordering, partial labs, validation)
  - approving a price report (price change, history, audit log, no double approval), rejecting one, and moderating a review
  - admin permissions (401 for guests and 403 for users on admin routes), create/edit/delete with the audit log, hiding a
    lab that has prices, price history on change, aliases, self-protection, and CSV import (preview, confirm, file type and size)

  The tests run against a separate database, `<your database>_test`. It is created, migrated and seeded on every run,
  and its name must end in `_test`.
- **UI: 28 Vitest + Testing Library tests** (`client/src/test`). They cover:
  - every route rendering in both languages
  - guards for `/favorites` and `/admin`
  - landing: headline outside the canvas, 2D fallback without WebGL, live API data
  - compare highlighting and filters, basket totals, search, and the formatting helpers

## Security

- Every route validates input with zod, and unknown fields are dropped.
- Every query is parameterized. Dynamic `WHERE` and `ORDER BY` clauses are built only from constant fragments and
  whitelists (`SqlParams` in `server/src/utils/sql.js`).
- bcrypt (12 rounds) for passwords. Login uses the same timing and error for unknown emails, so accounts can't be discovered.
- JWT algorithm pinned to HS256 with an issuer check. Access tokens live in memory only (never `localStorage`).
  Refresh tokens are httpOnly, `SameSite`, `Secure` in production, scoped to `/api/auth`, hashed in the database and
  rotated on use. A replayed old token revokes every session of that user.
- Rate limits:
  - login: 10 per 15 minutes
  - register: 10 per hour
  - reports and reviews: 30 per hour
  - whole API: 1,000 per 15 minutes
- helmet. CORS only for `CLIENT_URL`. JSON bodies capped at 100 kB. `trust proxy` is off unless configured.
- CSV upload: kept in memory, `.csv` only, 1 MB and 2,000 rows at most.
- Admin routes need `requireAuth` and `requireRole('admin')` on the server, as well as the client-side guard.
  Admins cannot demote or deactivate themselves, and the last admin can't be removed.
- No secrets in the repo: `.env` files are git-ignored, and the Git history was checked against the real `.env` values.

## Performance

- The landing page loads three.js lazily, in its own chunk, and only when the device can handle it.
  Lighthouse on the production build: **mobile 81**, **desktop 95** for performance, and 100 for accessibility, best
  practices and SEO. Details in [docs/landing-performance.md](docs/landing-performance.md).
- EXPLAIN ANALYZE on a throwaway database with 3,000 labs, about 120,000 prices and 18,000 reviews:
  - The compare query (city and home-collection filters, rating per lab) runs in **13 ms** using
    `lab_tests_test_id_price_idx` and `reviews_lab_status_idx`.
  - The basket query runs in **10 ms**.
  - No more indexes were needed.

## Known issues and limits

1. **Sample data only.** No real labs or prices yet. Real data must be entered by admins or imported by CSV.
2. **Mobile LCP is about 4.5 s** on Lighthouse's slow-4G phone profile, because the page is rendered in the browser.
   Pre-rendering the landing HTML (SSG/SSR) would fix it.
3. **Bangla search** uses substring matching, because `pg_trgm` cannot split Bengali text into useful trigrams.
   English searches tolerate typos; Bangla searches need a correct part of the name.
4. **Rate limits are kept in memory**, per server process. Several API instances would need a shared store such as Redis.
5. **No password reset or email verification** yet.
6. **Dev-only advisory:** `npm audit` reports 6 low-severity issues in `deepmerge`, which jest-config depends on. It is
   used only to run the tests, never at runtime, and every current Jest version is affected.
7. **The lab picker on "Report a price"** loads at most 100 labs. A searchable picker will be needed once there are more labs.
8. **The CSV import has no undo button.** Every change it makes is in `price_history` and the audit log, so it can be
   reverted by hand.
9. **The Node version matters:** the project targets Node 20.13. Vite 7, Vitest 5 and jsdom 27+ need newer Node
   versions, so the versions are pinned (Vite 6, Vitest 4, jsdom 26 through an npm override).

## Final checklist

| Item | Status |
|------|--------|
| Register, login, logout and token refresh work; admin routes are protected | ✅ API tests + browser flow |
| 3D landing page is smooth, has a fallback, and shows live data | ✅ full, lite, static and 2D tiers, live API sections |
| Search works in Bangla and English, including aliases like "CBC" | ✅ |
| Compare page highlights the cheapest lab and shows the saving | ✅ |
| Basket shows total price per lab | ✅ |
| Users can report prices and write reviews; admins approve them | ✅ |
| Admin can create, read, update and delete labs, tests, categories, areas and prices, and import CSV | ✅ |
| Every admin action is in the audit log | ✅ written in the same transaction as the change |
| Git: local only, phase branches merged with `--no-ff`, tags created, no remote, push is blocked | ✅ |
| Tests pass and the README is complete | ✅ 41 API + 28 UI tests |

## Git workflow (local only)

- Git is used **for local version control only**. A `.git/hooks/pre-push` hook blocks every push.
  Hooks are not versioned, so after a fresh clone recreate it:

  ```bash
  printf '#!/bin/sh\necho "Pushing is disabled for this project"\nexit 1\n' > .git/hooks/pre-push
  chmod +x .git/hooks/pre-push
  ```

- `main` holds stable work. Each phase was built on its own branch `phase-<n>-<name>`, merged with `git merge --no-ff`,
  and tagged `v0.<n>.0` (v0.0.0 to v0.9.0).
- Commit messages follow `type(scope): message`, for example `feat(api): add test search endpoint`.
