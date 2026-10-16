import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { clsx } from "clsx";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-sm shadow-brand-900/20 hover:shadow-md hover:shadow-brand-900/25",
  secondary: "bg-accent-600 text-white hover:bg-accent-500 shadow-sm shadow-accent-600/25",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4.5 py-2.5 text-sm",
  lg: "px-6.5 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={clsx(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={clsx(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)}>
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-slate-200/80 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "red" | "blue" | "indigo" | "brand" | "gold";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-sky-100 text-sky-700",
    indigo: "bg-brand-100 text-brand-700",
    brand: "bg-brand-100 text-brand-700",
    gold: "bg-gold-400/25 text-gold-600",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx("mb-1.5 block text-sm font-medium text-slate-700", className)}
    >
      {children}
    </label>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "slate" | "green" | "amber" | "red" | "blue" | "indigo"> = {
    processing: "blue",
    completed: "green",
    pending: "amber",
    "on-hold": "amber",
    cancelled: "red",
    refunded: "slate",
    failed: "red",
  };
  const label = status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge tone={map[status] ?? "slate"}>{label}</Badge>;
}

/** Consistent section heading used across the storefront pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={clsx(align === "center" && "mx-auto max-w-2xl")}>
        {eyebrow ? (
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-slate-500 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Star rating, rounded to the nearest half star. */
export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  const rounded = Math.round((rating || 0) * 2) / 2;
  return (
    <span className={clsx("inline-flex items-center gap-1", className)}>
      <span className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <svg key={star} className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="#ff934c" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
                    fill={`url(#half-${star})`}
                    stroke="#ffb74c"
                    strokeWidth="1"
                  />
                </>
              ) : (
                <path
                  d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
                  fill={filled ? "#ff934c" : "#e2e8f0"}
                  stroke={filled ? "#ffb74c" : "#e2e8f0"}
                  strokeWidth="1"
                />
              )}
            </svg>
          );
        })}
      </span>
      {typeof count === "number" ? (
        <span className="text-xs text-slate-500">({count})</span>
      ) : null}
    </span>
  );
}

/** Small breadcrumb trail used on detail pages. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-brand-700">
                  {item.label}
                </Link>
              ) : (
                <span className={clsx(last && "font-semibold text-slate-800")} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <svg className="h-3.5 w-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
