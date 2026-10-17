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
| `APP_URL` | no | Public base URL used in metadata. |
| `CASHFREE_APP_ID` | no | Cashfree App ID (Developers -> API Keys). Enables online payment at checkout. |
| `CASHFREE_SECRET_KEY` | no | Cashfree Secret Key. Required for online payment and webhook verification. |
| `CASHFREE_ENV` | no | `sandbox` (default) or `production`. |
| `CASHFREE_MOCK` | no | Local/test only (`1`): simulates a successful online payment when no API keys are present. Ignored in production. |
| `CASHFREE_BASE_URL`, `CASHFREE_API_VERSION` | no | Override the Cashfree API host/version (staging or pinned version). |
| `BREVO_API_KEY`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` | no | Sends signup verification codes. Without a key, local dev shows the code on screen. |
| `NIMBUSPOST_API_KEY` | no | NimbusPost API key. Enables delivery checks and shipment booking. |
| `ORIGIN_PINCODE_ARK`, `ORIGIN_PINCODE_BLR` | no | Origin pincode per warehouse. At least one is required for serviceability. |
| `NIMBUSPOST_DEFAULT_WAREHOUSE` | no | Warehouse used when a request omits one: `ARK` (default) or `BLR`. |
| `NIMBUSPOST_ORIGIN_PINCODE` | no | Legacy single-warehouse origin, used when the per-warehouse value is blank. |
| `NIMBUSPOST_BASE_URL` | no | Defaults to `https://api.nimbuspost.com/v1`. |
| `NIMBUSPOST_EMAIL`, `NIMBUSPOST_PASSWORD` | no | Dashboard login used to mint a bearer token when no API key is set. |
| `NIMBUSPOST_PICKUP_*` | no | Shared pickup address/phone for both warehouses; falls back to the brand address. |
| `NIMBUSPOST_{BLR,ARK}_*` | no | Per-warehouse overrides for name, address, city, state, phone, email and warehouse id. |
| `NIMBUSPOST_DEFAULT_ITEM_WEIGHT_GRAMS` | no | Weight assumed per line without a product weight (default `500`). |
| `NIMBUSPOST_WEBHOOK_SECRET` | yes (for tracking) | Shared secret required on tracking webhook calls; without it the webhook rejects every request. |

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

### Test mode

Set `CASHFREE_MOCK=1` in local development to exercise the whole online-payment
flow (order -> payment -> fulfilment) without Cashfree credentials. The checkout
shows a clearly labelled simulator; the flag is ignored when
`NODE_ENV=production`.

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

Delivery checks and shipments use the live NimbusPost API; no pincode list is
stored in the app. With `NIMBUSPOST_API_KEY` and `ORIGIN_PINCODE_ARK` /
`ORIGIN_PINCODE_BLR` set (default warehouse `ARK`):

- Checkout asks `POST /api/logistics/serviceability` before placing the order.
  An empty courier list returns HTTP 400 and blocks the order; a gateway outage
  (503/502) does not block checkout.
- Staff can book the cheapest courier from the admin order page via
  `POST /api/logistics/create-order`, which stores the AWB and courier.
- `/admin/logistics` lists pending AWBs grouped by courier;
  `POST /api/admin/logistics/generate-manifest` turns one courier's AWBs into a
  single manifest PDF. `POST /api/logistics/generate-manifest` exposes the same
  builder.
- `POST /api/webhooks/nimbuspost` consumes tracking updates and advances the
  shipment state, marking the order completed on delivery. Configure the URL in
  NimbusPost and set `NIMBUSPOST_WEBHOOK_SECRET` to authenticate the calls.

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

- Store images are served from `public/media/` (copied from the WordPress
  uploads directory).
