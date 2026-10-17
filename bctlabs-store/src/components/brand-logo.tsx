import Link from "next/link";
import { clsx } from "clsx";

/**
 * BCTLABS lockup: the official circuit-heart mark next to the wordmark, so it
 * stays legible at header size. `variant="light"` is for dark backgrounds.
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
  const light = variant === "light";

  return (
    <Link href="/" className={clsx("flex shrink-0 items-center gap-2.5", className)} aria-label={`${storeName} home`}>
      <img
        src="/brand/logo-mark.png"
        alt=""
        width={400}
        height={252}
        className="h-9 w-auto sm:h-10"
      />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={clsx(
            "text-lg font-black tracking-tight sm:text-xl",
            light ? "text-white" : "text-ink-900",
          )}
        >
          {storeName.toUpperCase()}
        </span>
        <span
          className={clsx(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
            light ? "text-brand-200" : "text-brand-600",
          )}
        >
          Lead the Future
        </span>
      </span>
    </Link>
  );
}
