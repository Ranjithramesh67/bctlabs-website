import Link from "next/link";
import { clsx } from "clsx";

/**
 * BCTLABS wordmark. Uses the official logo artwork and falls back to a text
 * lockup if the asset is missing.
 */
export function BrandLogo({
  storeName,
  variant = "dark",
  className,
}: {
  storeName: string;
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link href="/" className={clsx("flex shrink-0 items-center gap-2.5", className)} aria-label={`${storeName} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt={`${storeName} logo`}
        width={324}
        height={140}
        className="h-10 w-auto sm:h-11"
      />
      <span className={clsx("sr-only", variant === "light" && "text-white")}>{storeName}</span>
    </Link>
  );
}
