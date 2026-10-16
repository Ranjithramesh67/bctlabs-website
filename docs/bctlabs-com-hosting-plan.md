# bctlabs.com hosting plan

Plan for hosting the **existing WordPress site** `bctlabs.com` on your own
server. This is separate from the Laravel `bctlabsedu.com` site that this
repository ports to Next.js (see `DEPLOYMENT.md`).

The analysis below is based on a full export of the current host
(`u936390473` account, archive dated 2026-10-06) plus the WordPress database
dump. Sources inspected: `domains/bctlabs.com/public_html` (WP tree),
`wp_dump.sql` (database), and the archive file listing.

## 1. What the site actually is

| Layer | Component | Version |
| --- | --- | --- |
| CMS | WordPress core | 6.8.8 (single site, prefix `wp_`) |
| Commerce | WooCommerce | 10.7.0 (HPOS enabled) |
| Page builder | Elementor + Ultimate Addons (HFE) | 4.1.4 / 2.9.2 |
| Theme | Elessi (NasaTheme) + child | 6.3.9 / 1.0 |
| Theme engine | Nasa Core plugin | 6.3.9 |
| Cache | LiteSpeed Cache | 7.9.1 |
| Payments | PhonePe Payment Solutions | 3.0.4 |
| Invoices | WebToffee Print Invoices / Packing Slips | 5.0.1 |
| Migration | All-in-One WP Migration (With Import, `-master` build) | 6.77 |
| Niche plugins | Contact Form 7, Code Snippets Pro, Admin Menu Editor, Admin & Site Enhancements, Maintenance | see section 4 |
| Custom plugins | `bq-tax`, `bq-shipping-partner` | 1.0.7 / 1.1.0 |

Original host was **Hostinger on LiteSpeed**, with a Hostinger `mu-plugin`
(`hostinger-auto-updates.php`) that proxies WordPress.org update traffic.

Key functional facts that drive the hosting design:

1. **LiteSpeed Cache is server-dependent.** The plugin's full-page cache only
   works on a LiteSpeed or OpenLiteSpeed web server (or QUIC.cloud). On nginx
   or plain Apache it silently does nothing. The `.htaccess` LSCache block
   (`CacheLookup`, `CacheKeyModify`, `noabort`) requires LiteSpeed.
2. **The object cache expects Memcached.** `wp-content/.litespeed_conf.dat`
   points at `[::1]:11211`, and the drop-in `wp-content/object-cache.php`
   degrades to per-request cache if Memcached is absent.
3. **A real cron is effectively required.** Action Scheduler
   (`action_scheduler_run_queue`, every minute) drives WooCommerce session
   cleanup, order cache refresh, webhook delivery, and **PhonePe payment status
   polling** (backoff capped at 60s). Default WP-Cron on page loads is not
   reliable for a store.
4. **Outbound HTTPS is required** to PhonePe (`api.phonepe.com`,
   `mercury.phonepe.com`) and Delhivery (`ucp-app-webhooks.delhivery.com`).
5. **Inbound HTTPS callback is required** at
   `{site_url}/index.php/wp-json/wp-phonepe/v2/callback` (Basic Auth), so the
   site needs a valid TLS certificate and public reachability.
6. **No SMTP is configured** - order emails use host `sendmail`. A production
   mail relay (SMTP plugin or MTA) is strongly recommended.

## 2. Hard facts and sizes

| Item | Value |
| --- | --- |
| WordPress code + plugins + themes (no media) | ~1.2 GB on disk after extract |
| Media library (`wp-content/uploads`) | **2,057 files, ~91 MB**, no file over 1.85 MB |
| Database dump | 73 tables, ~13.5 MB plain SQL, all InnoDB |
| DB charset/collation | mostly `utf8mb4` / `utf8mb4_unicode_520_ci` |
| Source DB engine | MariaDB 11.8.9 dump (mysqldump 10.20) |
| Orders / users | 3,165 HPOS order rows; 23 users (1 admin, 1 shop_manager, 21 customers) |
| Plugin directory total | ~699 MB (Elementor, WooCommerce, AIO migration dominate) |

Notable risks found in the dump/archive:

1. **Web-exposed backup (critical).** A 447 MB full-site `.wpress` archive
   sits in the web root at
   `wp-content/plugins/All-In-One-WP-Migration-With-Import-master/storage/wvai7h24ykte/`
   with only an `index.php` guard (no deny rule). It contains `wp-config.php`
   and the entire database. A second 379 MB `.wpress` is in
   `domains/bctlabs.com/.trash/`. **Both must be removed before go-live.**
2. **Slider Revolution is missing but its data remains.** Eight
   `wp_revslider_*` tables exist and the Elessi/Nasa Core integration plus
   slider shortcodes expect the `revslider` plugin, which is **not** present in
   `wp-content/plugins`. Sliders will render empty until it is reinstalled
   (the theme admin can fetch `revslider.zip` from its installer repo).
3. **Zero dates in the dump** (`0000-00-00`, ~50 occurrences). Importing into
   MySQL 8 / MariaDB with strict `NO_ZERO_DATE` can fail. Import with
   `sql_mode` relaxed, or import into MariaDB.
4. **Site URL is `http://bctlabs.com`** with no HTTPS enforcement, though most
   content already uses `https://`. Requires a serialization-safe
   search-replace plus an HTTPS redirect.
5. **All-in-One WP Migration is an untrusted `-master` build** (not a vendor
   release). Retire it after migration or replace with a vendor release.

## 3. Recommended target architecture

Pick **Option A** unless you are standardised on nginx.

### Option A - OpenLiteSpeed + LSCache (recommended)

Preserves current behaviour (full-page cache, `noabort`, query-string cache-key
normalisation) with the least change. The existing `.htaccess` works largely
as-is because OpenLiteSpeed/LiteSpeed understands Apache-style directives.

- Web server: OpenLiteSpeed (free) or LiteSpeed Enterprise (drop-in Apache).
- PHP: `lsphp82` (PHP 8.2) with the `lsapi` interface.
- DB: MariaDB 11.x (matches source; safest for the dump).
- Cache: LiteSpeed Cache plugin page cache + Memcached object cache.
- TLS: Let's Encrypt via `certbot` or the OpenLiteSpeed ACME tool.

### Option B - nginx + PHP-FPM

Works, but the server-level page cache must be re-provided. Use an nginx
`fastcgi_cache` zone (or a WP page-cache plugin) and keep LiteSpeed Cache only
for its CSS/JS/image optimisation, or drop it entirely. All `.htaccess`
security rules must be re-expressed in the server block (section 6).

### Server sizing

| Resource | Minimum | Recommended |
| --- | --- | --- |
| vCPU | 2 | 4 |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 22.04/24.04 LTS or Debian 12 | same |

The site is small (91 MB media, 13.5 MB DB). Disk is dominated by the plugin
tree (~700 MB) and should be sized for future uploads and backups.

## 4. Required software

| Requirement | Value |
| --- | --- |
| WordPress | 6.8.8 (keep; WooCommerce/Elementor declare `Requires at least 6.8`) |
| PHP | 8.2 recommended (`7.4` is the plugin floor but EOL) |
| MySQL/MariaDB | MariaDB 11.x or MySQL 8.0+ |
| PHP extensions | `json hash mysqli curl mbstring zip iconv dom libxml zlib gd` (or `imagick`) `openssl intl bcmath` (or `gmp`) `exif fileinfo` |
| Memcached | daemon + PHP `memcached` extension (for the object-cache drop-in) |
| Cron | system cron or systemd timer calling `wp-cron.php` every minute |
| WP-CLI | recommended, for search-replace, cache flushes, user management |
| TLS | Let's Encrypt certificate for `bctlabs.com` and `www` |

Suggested php.ini (PHP-FPM / lsphp pool):

```ini
upload_max_filesize = 256M
post_max_size       = 256M
memory_limit        = 512M
max_execution_time  = 600
max_input_time      = 300
max_input_vars      = 5000
```

If you keep All-in-One WP Migration for a period, the web tier also needs
`client_max_body_size 256m` (nginx) and a long `fastcgi_read_timeout`.

## 5. Directory layout and deploy steps

Suggested layout (adapt the user paths):

```text
/var/www/bctlabs.com/
  public_html/        <- document root (WordPress)
  private/            <- .wpress backups, DB dumps (NOT web-served)
  logs/
```

Deploy steps:

1. Provision PHP 8.2 (lsphp or FPM), MariaDB 11, Memcached, and the web server.
2. Create the database and a dedicated DB user; note the credentials.
3. Copy the WordPress tree (already extracted locally at
   `/tmp/opencode/bctlabs_wp/domains/bctlabs.com/public_html`) to
   `public_html`, excluding `wp-content/uploads`, the AIO `storage/` dir, and
   cache/log directories.
4. Transfer `wp-content/uploads` separately (only ~91 MB, rsync is ideal):
   ```bash
   # Preview the transfer
   rsync -aHAX --numeric-ids --dry-run --stats uploads/ user@server:/var/www/bctlabs.com/public_html/wp-content/uploads/
   ```
   ```bash
   # Real transfer
   rsync -aHAX --numeric-ids --info=progress2 uploads/ user@server:/var/www/bctlabs.com/public_html/wp-content/uploads/
   ```
5. Import the database (serialization-safe; see section 7).
6. Create a new `wp-config.php` from the existing values, with rotated DB
   credentials and salts (section 8), plus `DISABLE_WP_CRON`, `FORCE_SSL_ADMIN`,
   and `WP_HOME`/`WP_SITEURL`.
7. Set ownership and permissions: files owned by the PHP user, dirs `755`,
   files `644`, `wp-config.php` `600`.
8. Install the TLS certificate and enable HTTPS; add the HTTP to HTTPS redirect.
9. Install Memcached, start it on `127.0.0.1:11211` (and `::1`), verify the
   object-cache drop-in connects.
10. Add the cron entry (section 9), run `wp cache flush`, then smoke-test.

## 6. Web server configuration

### Option A (OpenLiteSpeed / LiteSpeed)

Point the vhost document root at `public_html`, enable a rewrite (front
controller) and the LSCache module, then keep the site's `.htaccess` mostly
intact. Translate only these for safety if not already covered by the panel:

- deny access to `wp-config.php`, `.private/`, `*.litespeed_conf.dat`,
  `wp-content/plugins/*/storage/`, and `wc-logs/*.log`.

### Option B (nginx)

`.htaccess` is ignored, so re-express everything. Minimum server block:

```nginx
server {
    listen 443 ssl http2;
    server_name bctlabs.com www.bctlabs.com;
    root /var/www/bctlabs.com/public_html;
    index index.php index.html;
    client_max_body_size 256m;

    # WordPress front controller (replaces the .htaccess rewrite block)
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_read_timeout 3600;
        # Required for the WP REST API and Application Passwords
        fastcgi_param HTTP_AUTHORIZATION $http_authorization;
    }

    # Security (translated from .htaccess, which nginx does not read)
    location = /wp-config.php        { deny all; }
    location ^~ /.private/           { deny all; }
    location ~* \.litespeed_conf\.dat$ { deny all; }
    location ~* /litespeed/debug/.*\.log$ { deny all; }
    location ^~ /wp-content/plugins/All-In-One-WP-Migration-With-Import-master/storage/ { deny all; }
    location ~* /wc-logs/.*\.log$    { deny all; }
    location ~ /\.(?!well-known)     { deny all; }

    location ~* \.(?:jpg|jpeg|gif|png|ico|webp|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name bctlabs.com www.bctlabs.com;
    return 301 https://$host$request_uri;
}
```

## 7. Database migration

1. The dump is MariaDB 11.8 style. Import into MariaDB 11.x, or into MySQL 8
   with `sql_mode` relaxed for the import:
   ```sql
   SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';
   ```
2. Import:
   ```bash
   # Import the dump into the new database
   mysql -h 127.0.0.1 -u wpsite -p bctlabs_wp < wp_dump.sql
   ```
3. Fix the site URL with a serialization-aware replace (never `sed` the SQL;
   Elementor and widget data are PHP-serialized):
   ```bash
   # Point WordPress at the new HTTPS URL
   wp search-replace 'http://bctlabs.com' 'https://bctlabs.com' --all-tables --precise --skip-columns=guid
   ```
4. Purge caches after the replace (LiteSpeed, WooCommerce transients).
5. If the domain changes, run an additional `wp search-replace` from
   `https://bctlabs.com` to the new hostname.

## 8. wp-config.php changes

Start from the exported file and change:

1. `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` to the new database.
2. Replace **all** salts and keys with fresh values
   (`https://api.wordpress.org/secret-key/1.1/salt/`).
3. Add:
   ```php
   define( 'WP_HOME', 'https://bctlabs.com' );
   define( 'WP_SITEURL', 'https://bctlabs.com' );
   define( 'FORCE_SSL_ADMIN', true );
   define( 'DISABLE_WP_CRON', true );
   define( 'DISALLOW_FILE_EDIT', true );
   ```
4. Keep `FS_METHOD = 'direct'` only if the PHP user owns the tree; otherwise
   updates will fail.
5. Remove or replace the Hostinger `mu-plugin`
   (`wp-content/mu-plugins/hostinger-auto-updates.php`), which proxies updates
   through Hostinger endpoints and disables auto-updates.

## 9. Cron and background work

Add a single system cron entry. With `DISABLE_WP_CRON` on, this drains
WP-Cron and the whole Action Scheduler queue (WooCommerce, PhonePe polling,
invoice jobs, Delhivery webhooks):

```cron
# Drain WordPress cron (WP-Cron + Action Scheduler) every minute
* * * * * /usr/bin/php -q /var/www/bctlabs.com/public_html/wp-cron.php >/dev/null 2>&1
```

Verify `action_scheduler_run_queue` drains and that pending counts fall to near
zero after cutover.

## 10. Third-party integrations to reconfigure

| Integration | Action |
| --- | --- |
| PhonePe | Set the callback/webhook URL to the new `https://.../wp-json/wp-phonepe/v2/callback`; re-verify merchant credentials; test a live (or sandbox) payment. |
| Delhivery UCP | 3 active WooCommerce webhooks POST to `ucp-app-webhooks.delhivery.com`. Re-confirm the destination and that the inbound WC REST API key still works from the new IP. |
| Email | No SMTP today. Add an SMTP plugin (or an MTA with a proper PTR/SPF/DKIM) so order emails from `info@bctlabs.com` are delivered. |
| Google Fonts | Loaded at runtime (theme/Nasa Core and the `bq-*` plugins). Allowed, but self-host if you need privacy/GDPR compliance. |

## 11. Pre-go-live security cleanup

1. **Delete both `.wpress` backups** (web-root `storage/` copy and `.trash/`
   copy) or move them to `private/` off the web root.
2. Remove the AIO `storage/` logs (`error.log`, `export.log`, `import.log`,
   `filemap.list`) from the web root.
3. Rotate the DB password and all admin/shop_manager passwords (old hashes and
   credentials are recoverable from the exports).
4. Re-import or install the **missing Slider Revolution** plugin so existing
   sliders render; or accept empty sliders.
5. Retire or replace the `-master` AIO migration plugin after the move.
6. Confirm the deny rules for `wc-logs`, `woocommerce_uploads`, invoice dirs,
   and `wp-content/litespeed` on the new stack (nginx ignores `.htaccess`).
7. Audit the 11 customer accounts created in 2026 with random Gmail addresses
   (likely spam/abuse signups; no admin role was granted).
8. Consider a login-limiting / 2FA plugin (none installed today) and disable
   XML-RPC if unused.
9. Set file permissions: dirs `755`, files `644`, `wp-config.php` `600`.
10. Prune one or two unused default themes (Twenty Twenty-Three/Four/Five) if
    you want to reduce the tree.

## 12. Cutover checklist

1. Provision server, PHP, MariaDB, Memcached, web server, TLS.
2. Deploy code (excluding media/cache/backups) and media.
3. Import DB and run the serialization-safe search-replace.
4. Finalise `wp-config.php` (rotated secrets, HTTPS, cron disabled).
5. Configure the vhost (Option A or B) and HTTPS redirect.
6. Add the cron entry; confirm Action Scheduler drains.
7. Flush caches; verify the object cache connects to Memcached.
8. Test: home, shop, product, cart, checkout (COD), a PhonePe live payment,
   Delhivery webhook delivery, order email, admin login, a slider.
9. Point DNS at the server; re-issue/renew TLS if needed.
10. Reconfigure PhonePe callback and Delhivery webhook URLs to the live domain.
11. Remove the exported backups and logs; rotate secrets.
12. Enable monitoring (uptime + error logs) and set a backup schedule.

## 13. Decisions needed from you

1. Which web server will the target use: **OpenLiteSpeed (Option A, recommended)**
   or **nginx (Option B)**?
2. Will the domain stay `bctlabs.com`, or is it changing?
3. Do you have the target server details (OS, root access, panel) so this can be
   turned into concrete commands and a deploy script?
4. Should we keep the current WordPress site as-is, or is the goal to
   consolidate it with the Next.js rebuild of `bctlabsedu.com`?
