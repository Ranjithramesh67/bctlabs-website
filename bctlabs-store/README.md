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

## Routes

| Area | Routes |
| --- | --- |
| Storefront | `/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search`, `/blog`, `/blog/[slug]`, `/pages/[slug]`, `/about-us`, `/contact-us` |
| Cart & checkout | `/cart`, `/checkout`, `/checkout/success`, `/order-tracking` |
| Account | `/account`, `/account/login`, `/account/register`, `/account/orders`, `/account/orders/[id]` |
| Admin (staff only) | `/admin`, `/admin/orders`, `/admin/orders/[id]`, `/admin/products`, `/admin/customers`, `/admin/messages` |
| API | `/api/cart`, `/api/orders`, `/api/track-order`, `/api/auth/*`, `/api/admin/*`, `/api/contact` |

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
