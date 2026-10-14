# Admin port guide (Laravel Blade → Next.js)

This project is a faithful port of the Laravel app at
`/tmp/opencode/bctlabs_laravel/domains/bctlabsedu.com/public_html`.
The public site, web auth and mobile API are already done. This guide covers
the **admin panel** (`/admin/*`).

## Golden rules

1. **Fidelity**: reproduce the original HTML structure and CSS classes exactly
   (Bootstrap 4 + Stisla). Keep the same headings, labels, buttons, icons
   (`fas fa-*`), table/card markup and ordering. Do not redesign.
2. **Never modify shared files.** Only create files inside your assigned
   directory (`src/app/admin/<your-module>/...` and
   `src/components/admin/<your-module>-*.tsx`). If you need a shared change,
   report it in your final message instead.
3. **Read the original first.** Always open the Blade view + controller +
   Livewire component before writing code, and mirror the field names,
   validation and redirect targets.
4. **Copy, don't invent.** Paths, messages, and behaviour must match the
   Laravel code. Use `t("...")` for `__('messages....')` strings.

## Stack facts

- Next.js 16 App Router, React 19, TypeScript, Prisma 7 (MariaDB adapter).
- Every page/route that reads cookies or DB must include `export const instant = false;`
  and (where needed) `await connection()`.
- `params` and `searchParams` are **Promises**: `const { id } = await params;`.
- Prisma ids are `BigInt` for most tables — wrap with `BigInt(numericId)`.
- `_ = await getCurrentUser()` at the top of every admin page to enforce auth.
- Page components are async server components by default.

## Shared helpers (import, do not edit)

- `@/lib/auth` → `getCurrentUser()` (redirects when signed out), `hasRole`, `ADMIN_HOME`.
- `@/lib/admin/permissions` → `can(user, "manage_xyz")` (Spatie parity).
- `@/lib/admin/settings` → `getSettings`, `getSetting`, `getAppName`, `getAppLogo`,
  `getCurrencyClass`, `SETTING_GROUPS`.
- `@/lib/admin/flash` → `setFlash("success" | "error", message)` in actions.
- `@/lib/admin/format` → `strLimit`, `htmlDecode`, `ucfirst`, `numberFormat2`, `slugify`.
- `@/lib/admin/upload` → `saveUpload(file, "relative/path.ext")`, `deleteUpload(path)`, `isUpload(entry)`.
- `@/lib/i18n` → `t("common.save")` for `__('messages.common.save')`.
- `@/lib/prisma` → `prisma`.
- `@/components/admin/ui` → `AdminSection`, `Paginator`, `PaginatorRow`.
- `@/components/admin/flash` → `Flash` (already rendered by the admin layout, do not add).

## Page conventions

```tsx
import { AdminSection, PaginatorRow } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export default async function Page({ searchParams }: { searchParams: Promise<{...}> }) {
  await getCurrentUser();
  // ...load data...
  return (
    <AdminSection title={t("some.title")} backHref="/admin/...">
      <div className="card"><div className="card-body">{/* original markup */}</div></div>
    </AdminSection>
  );
}
```

## Mutations = Server Actions

Create `actions.ts` in the module folder with `"use server"` at the top.
Each action: validate → mutate via Prisma → `setFlash(...)` → `redirect(...)`.

```ts
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function storeThing(formData: FormData) {
  await getCurrentUser();
  // validate...
  await prisma.things.create({ data: { /* ... */ } });
  await setFlash("success", "Saved successfully");
  redirect("/admin/things");
}
```

Forms: `<form action={storeThing} method="post">`, keep the original field
names (`name="title"`, etc.). For file uploads use `enctype` via
`<form action={action}>` (React sets multipart automatically when a `File` is
present) and read with `formData.get("image") as File`.

Delete in the original was often a GET link; render it as a small `<form>`
with a hidden `id` and a submit button styled with the same icon/classes.

## Route map

Laravel route → Next.js path (keep the exact original path):

| Laravel | Next.js |
| --- | --- |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` |
| `/admin/get_category` | `src/app/admin/get_category/page.tsx` |
| `/admin/category/create` | `src/app/admin/category/create/page.tsx` |
| `/admin/category/{id}/edit` | `src/app/admin/category/[id]/edit/page.tsx` |
| `/admin/event/index?pages=x` | `src/app/admin/event/index/page.tsx` |
| `/admin/settings?group=x` | `src/app/admin/settings/page.tsx` |

Use the literal Laravel path segments (e.g. `get_category`, `get_blogcategory`)
so links match the original.

## Verification (required)

After your module runs `npx tsc --noEmit` clean and `npx eslint src --max-warnings=0`
clean, smoke-test with curl against the running dev server on port 3000:

```bash
# login once (admin@job.com / 123456)
curl -s -c /tmp/cj.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@job.com","password":"123456"}'
curl -s -b /tmp/cj.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/<your-path>
```

Report which routes you verified and their status codes.
