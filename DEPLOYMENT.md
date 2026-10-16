# Deployment guide (Vercel / Netlify)

This app is a Next.js 16 (App Router) port of the Laravel `bctlabsedu.com`
site. It talks to the existing **MySQL/MariaDB** database through Prisma 7
(driver adapter). A production build passes locally (`npm run build`).

## 1. Requirements

- Node.js 20+ (built and tested on Node 22).
- A **network-reachable MySQL/MariaDB** database that contains the existing
  `u936390473_bct_labs` schema and data. The local development database
  (`127.0.0.1:3306`) is not reachable from Vercel/Netlify, so you must host the
  database (PlanetScale, Railway, Aiven, Amazon RDS, a VPS, etc.) and import a
  dump there.
- The environment variables listed below.

## 2. Environment variables

Set these in the Vercel/Netlify dashboard (see `.env.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/db`. Add `?sslaccept=strict` (or the provider's SSL params) when the host requires TLS. |
| `SESSION_SECRET` | yes | 32+ byte base64 secret. Generate with `openssl rand -base64 32`. |
| `SESSION_LIFETIME_MINUTES` | no | Default `120`. |
| `APP_URL` | yes | Public base URL, e.g. `https://your-app.vercel.app`. |
| `MAIL_TO_EMAIL`, `MAIL_FROM_EMAIL`, `BREVO_API_KEY` | no | Contact-form email relay. Without `BREVO_API_KEY` the message is stored but no email is sent. |

## 3. Database migration

Export the local database and import it into the hosted database:

```bash
# Dump the local database (run where the source DB is reachable)
mysqldump --single-transaction --routines --triggers \
  -u bctlabs -p u936390473_bct_labs > bctlabs.sql

# Import into the hosted database
mysql -h HOST -u USER -p DATABASE_NAME < bctlabs.sql
```

There are no Prisma migrations to run: the schema was introspected from the
existing database (`prisma db pull`). The Prisma Client is regenerated
automatically on install via the `postinstall` script (`prisma generate`).

## 4. Vercel

1. Push this repository to GitHub (the `origin` remote already points at
   `https://github.com/Ranjithramesh67/bctlabs-website`).
2. In Vercel, "Add New Project" and import the repository.
3. Framework preset: **Next.js** (auto-detected). Build command `npm run build`,
   output handled automatically.
4. Add the environment variables from section 2 (Production + Preview).
5. Deploy.

No `vercel.json` is required.

## 5. Netlify

1. Import the repository in Netlify.
2. Netlify auto-detects Next.js through the official Next.js runtime
   (`@netlify/plugin-nextjs`, installed automatically).
3. Add the environment variables from section 2.
4. Deploy.

## 6. Known limitations on serverless hosts

These features write to the local filesystem. Locally they behave exactly like
the original Laravel app, but on Vercel/Netlify the filesystem is read-only
(except `/tmp`), so they will fail or silently not persist:

- **File uploads** (member/customer profile pictures, event/slider/dashboard
  images, career-application resumes). The original used Laravel's MediaLibrary
  with a configurable disk. To make uploads work in production, switch the
  upload helpers to object storage (Vercel Blob, S3, Cloudflare R2, etc.).
- **Translation manager** (`/admin/translation-manager`): editing translations
  writes PHP files under `lang/`. Use object storage or mount a writable volume,
  or accept that translation edits are a local-only feature.
- **Contact-form email** requires `BREVO_API_KEY`; without it no email is sent
  (the submission is still stored).

Additionally, serverless functions open short-lived database connections. Use a
connection pooler (Prisma Accelerate, the provider's proxy, or a small pool) to
avoid exhausting the database's connection limit under load.

## 7. Local development / preview

```bash
# Install dependencies (also runs `prisma generate`)
npm install

# Configure the database and session secret
cp .env.example .env

# Start the dev server on http://localhost:3000
npm run dev
```

Admin panel: `/admin` (for example `admin@job.com` / `123456` in the seeded
data).

## 8. Dual-app hosting (bctlabsedu.com + bctlabs.com store)

This repository hosts two independent Next.js applications that share one
MariaDB/MySQL server but use **separate databases**:

| App | Path | Port | Database | Public URL |
| --- | --- | --- | --- | --- |
| Education site (this root app) | `/` | 3000 | `u936390473_bct_labs` | bctlabsedu.com |
| Store / bctlabs.com | `/bctlabs-store` | 4000 | `u936390473_ny0Uv` | bctlabs.com |

The store app is a Next.js 16 re-implementation of the WordPress + WooCommerce
site. It maps its Prisma models straight onto the existing WordPress/WooCommerce
tables (including WooCommerce HPOS order tables), so the original WordPress
database keeps working unchanged and new orders created by the store app are
visible to WooCommerce (and vice versa).

### Running both apps locally

```bash
# Education site (root app) on http://localhost:3000
npm install
npm run dev

# Store (bctlabs.com) on http://localhost:4000
cd bctlabs-store
npm install
npm run dev
```

Each app reads its own `.env` (see `bctlabs-store/.env.example`). Both must
point `DATABASE_URL` at the same database server (different database names) and
use different `SESSION_SECRET` values.

### Running both in production (single server)

Run the two apps as separate Node processes behind one reverse proxy
(nginx/OpenLiteSpeed/Caddy), routing each hostname to its port:

- `bctlabsedu.com` -> `127.0.0.1:3000`
- `bctlabs.com` and `www.bctlabs.com` -> `127.0.0.1:4000`

```bash
# Education site
npm run build && npm run start -- -p 3000

# Store
cd bctlabs-store
npm run build && npm run start -- -p 4000
```

### Store admin

The store has its own admin area at `/admin` (staff-only; WordPress
`administrator` and `shop_manager` roles can sign in). See
`bctlabs-store/README.md` for details.

### Deployment checklist

- `bctlabs-store/prisma/schema.prisma` is introspected from the WooCommerce
  database; run `npx prisma generate` (also runs on `npm install`) after any
  schema change.
- Copy `bctlabs-store/public/media/` (the WordPress uploads) alongside a
  production build, or serve those files from the same origin.
- Remove the web-exposed WordPress archives before go-live
  (`wp-content/ai1wm-backups/*.wpress`, `.trash/`).
- Do not reuse the WordPress `db_user` credentials; use a dedicated database
  user for the store app.
