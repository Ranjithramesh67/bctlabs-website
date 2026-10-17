# BCTLABS Store (bctlabs.com)

A Next.js 16 (App Router, TypeScript, Tailwind v4) storefront that replaces the
WordPress + WooCommerce front end of **bctlabs.com**. It runs directly on the
existing WordPress/WooCommerce database, so no data migration is required.

## How it works

- Prisma models map one-to-one onto the WordPress/WooCommerce tables
  (`wp_posts`, `wp_postmeta`, `wp_terms`, ... and the WooCommerce HPOS order
  tables `wp_wc_orders`, `wp_wc_order_addresses`, `wp_wc_order_product_lookup`,
  `wp_wc_order_stats`).
- Products, categories, pages and posts are read from the WordPress tables.
- Orders placed at checkout are written as WooCommerce-compatible HPOS rows, so
  they show up in WooCommerce admin too.
- Customer accounts reuse the WordPress `wp_users` table and the
  `$wp$2y$` bcrypt password hashes, so existing customers can sign in.
- Returning customers can save up to 10 billing/shipping addresses in
  `bctlabs_customer_addresses`, reuse them at checkout and manage them from
  `/account`. Checkout also offers to save the address used for an order.

The app is independent from the education site in the repository root; the two
share a database server but use separate databases. See `../DEPLOYMENT.md`
section 8 for the dual-app hosting layout.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The store runs on http://localhost:4000.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/u936390473_ny0Uv` (the WooCommerce database). |
| `SESSION_SECRET` | yes | 32+ byte base64 secret. Generate with `openssl rand -base64 32`. |
| `APP_URL` | no | Public base URL used in metadata and payment return/webhook URLs. When it is `localhost`, requests served through an HTTPS proxy use the forwarded host instead. |
| `CASHFREE_APP_ID` | no | Cashfree App ID (Developers -> API Keys). Enables online payment at checkout. |
| `CASHFREE_SECRET_KEY` | no | Cashfree Secret Key. Required for online payment and webhook verification. |
| `CASHFREE_ENV` | no | `sandbox` (default) or `production`. |
| `CASHFREE_SANDBOX_APP_ID`, `CASHFREE_SANDBOX_SECRET_KEY` | no | Optional sandbox key pair used when `CASHFREE_ENV=sandbox`, so live keys can stay configured for production. |
| `CASHFREE_MOCK` | no | Local/test only (`1`): simulates a successful online payment instead of calling Cashfree. Ignored in production. |
| `CASHFREE_BASE_URL`, `CASHFREE_API_VERSION` | no | Override the Cashfree API host/version (staging or pinned version). |
| `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` | no | Sends signup verification codes. Without a key, local dev shows the code on screen. |
| `NIMBUSPOST_API_KEY` | no | NimbusPost API key id (`npk_...`, Settings -> API Keys). Enables delivery checks and shipment booking. |
| `NIMBUSPOST_API_SECRET` | no | Secret paired with the key id. Required together with `NIMBUSPOST_API_KEY`. |
| `ORIGIN_PINCODE_ARK`, `ORIGIN_PINCODE_BLR` | no | Origin pincode per warehouse. At least one is required for serviceability. |
| `NIMBUSPOST_DEFAULT_WAREHOUSE` | no | Warehouse used when a request omits one: `ARK` (default) or `BLR`. |
| `NIMBUSPOST_ORIGIN_PINCODE` | no | Legacy single-warehouse origin, used when the per-warehouse value is blank. |
| `NIMBUSPOST_BASE_URL` | no | Defaults to `https://api-v2.nimbuspost.com` (Partner API v2). |
| `NIMBUSPOST_EMAIL`, `NIMBUSPOST_PASSWORD` | no | Legacy only: dashboard login used to mint a bearer token when no key pair is set. |
| `NIMBUSPOST_PICKUP_*` | no | Shared pickup address/phone for both warehouses; falls back to the brand address. |
| `NIMBUSPOST_{BLR,ARK}_*` | no | Per-warehouse overrides for name, address, city, state, phone, email and warehouse id. |
| `NIMBUSPOST_PICKUP_WAREHOUSE_ID` | to book | Pickup warehouse id registered in NimbusPost. Booking fails with a clear message when it is unset. |
| `NIMBUSPOST_DEFAULT_ITEM_WEIGHT_GRAMS` | no | Weight assumed per line without a product weight (default `500`). |
| `NIMBUSPOST_WEBHOOK_SECRET` | yes (for tracking) | HMAC secret used to verify the `x-nimbus-signature` header over the raw body; without it the webhook rejects every request. |

## Routes

| Area | Routes |
| --- | --- |
| Storefront | `/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search`, `/blog`, `/blog/[slug]`, `/pages/[slug]`, `/about-us`, `/contact-us` |
| Cart & checkout | `/cart`, `/checkout`, `/checkout/success`, `/checkout/cashfree/return`, `/order-tracking` |
| Account | `/account`, `/account/login`, `/account/register`, `/account/orders`, `/account/orders/[id]` |
| Admin (staff only) | `/admin`, `/admin/orders`, `/admin/orders/[id]`, `/admin/products`, `/admin/customers`, `/admin/messages`, `/admin/logistics` |
| API | `/api/cart`, `/api/orders`, `/api/track-order`, `/api/auth/*`, `/api/admin/*`, `/api/contact`, `/api/logistics/*`, `/api/payments/cashfree/order`, `/api/webhooks/cashfree`, `/api/webhooks/nimbuspost` |

## Payments (Cashfree)

Checkout supports **cash on delivery** out of the box and **online payment via
Cashfree** once credentials are configured. When `CASHFREE_APP_ID` and
`CASHFREE_SECRET_KEY` are both set, a "Pay online" option appears at checkout;
otherwise only cash on delivery is offered.

Online flow:

1. `POST /api/orders` creates the WooCommerce order and a matching Cashfree order
   (`bct-<orderId>`); `POST /api/payments/cashfree/order` returns the payment
   session and reuses an existing one for the same order.
2. The Cashfree checkout SDK is embedded at checkout (element mode, falling back
   to the modal) so the customer stays on the store domain.
3. Cashfree redirects back to `/checkout/cashfree/return`, which verifies the
   payment and marks the order as paid.
4. `POST /api/webhooks/cashfree` confirms payments server-side even if the
   customer never returns. The HMAC is verified over the raw body with a
   constant-time compare, the amount must match the stored order, and a unique
   event key makes replays idempotent. `POST /api/payments/cashfree/webhook` is
   kept as an alias.

Register the webhook in the Cashfree dashboard pointing at
`{APP_URL}/api/webhooks/cashfree`.

`APP_URL` must be the public HTTPS origin before going live: it is used for the
payment return URL and the webhook `notify_url`, so `localhost` only works for a
local walkthrough. Behind an HTTPS preview proxy the app uses the forwarded
host when `APP_URL` is `localhost`. Production Cashfree rejects non-HTTPS URLs;
the order route then marks the order failed and asks the customer to use cash on
delivery instead of leaving a pending order behind. Sandbox keys require
`CASHFREE_ENV=sandbox`; live keys require `CASHFREE_ENV=production` and are
rejected by the other host.

Verify a key pair before deploying (no order is created):

```bash
node scripts/check-cashfree.mjs
```

It reads `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` (and `CASHFREE_ENV`) from
`.env`, or accepts them as arguments. Payment Gateway keys are a different
product from the Payouts keys shown on some Cashfree screens; Payouts keys are
rejected by the gateway with 401.

### Test mode

Set `CASHFREE_MOCK=1` in local development to exercise the whole online-payment
flow (order -> payment -> fulfilment) without contacting Cashfree. The checkout
shows a clearly labelled simulator; the flag is ignored when
`NODE_ENV=production` and wins over a configured key pair.

With sandbox keys, set `CASHFREE_ENV=sandbox` (and optionally
`CASHFREE_SANDBOX_APP_ID` / `CASHFREE_SANDBOX_SECRET_KEY`). Sandbox does not
require domain whitelisting. Live keys additionally require the storefront
origin to be whitelisted in the Cashfree dashboard
(Developers -> Whitelisting); until then payment sessions fail with a
domain-not-approved error.

## Signup verification

New accounts require a 6 digit email code before they are created:

1. `POST /api/auth/register` validates the form and stores a hashed code with a
   10 minute expiry (the WordPress user is not created yet).
2. The code is emailed through Brevo when `BREVO_API_KEY` is set. In local
   development without a key, the code is returned to the browser and shown on
   the verification screen.
3. `POST /api/auth/verify-otp` consumes the code and creates the account.
   `POST /api/auth/resend-otp` issues a fresh code after a 60 second cooldown.

## Logistics (NimbusPost)

Delivery checks and shipments use the live NimbusPost **Partner API v2**
(`https://api-v2.nimbuspost.com/v2`), authenticated with the `x-api-key` /
`x-api-secret` pair; no pincode list is stored in the app. Create the key pair
under Settings -> API Keys in the NimbusPost dashboard. With
`NIMBUSPOST_API_KEY`, `NIMBUSPOST_API_SECRET` and `ORIGIN_PINCODE_ARK` /
`ORIGIN_PINCODE_BLR` set (default warehouse `ARK`):

- Checkout asks `POST /api/logistics/serviceability` before placing the order.
  An empty courier list returns HTTP 400 and blocks the order; a gateway outage
  (503/502) does not block checkout.
- Staff can book the cheapest courier from the admin order page via
  `POST /api/logistics/create-order`, which stores the AWB and courier. Booking
  needs a pickup warehouse: add it (and verify its contact phone) in NimbusPost,
  then set `NIMBUSPOST_PICKUP_WAREHOUSE_ID`.
- `/admin/logistics` lists pending AWBs grouped by courier;
  `POST /api/admin/logistics/generate-manifest` turns one courier's AWBs into a
  single manifest PDF. `POST /api/logistics/generate-manifest` exposes the same
  builder.
- `POST /api/webhooks/nimbuspost` consumes tracking updates and advances the
  shipment state, marking the order completed on delivery. Register the URL at
  `{APP_URL}/api/webhooks/nimbuspost` for `tracking.updated` (and optionally the
  order events) using `NIMBUSPOST_WEBHOOK_SECRET` as the signing secret; the
  route verifies the HMAC over the raw body with a constant-time compare.

## Admin access

`/admin` is restricted to WordPress users with the `administrator` or
`shop_manager` capability. Sign in with the WordPress account credentials on the
admin login screen.

## Local database notes

- The contact form stores submissions in the `bctlabs_contact_messages` table.
  Create it once with:

```sql
CREATE TABLE IF NOT EXISTS bctlabs_contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(64) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- Saved addresses live in `bctlabs_customer_addresses`. The schema changes for
  the store-managed tables (`bctlabs_*`) are kept as SQL migrations in
  `prisma/migrations/*/migration.sql` and can be applied in order to an existing
  database:

```bash
for file in prisma/migrations/*/migration.sql; do
  mysql -h HOST -u USER -p DATABASE_NAME < "$file"
done
```

- Store images are served from `public/media/` (copied from the WordPress
  uploads directory).
