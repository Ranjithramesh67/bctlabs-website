import { clsx } from "clsx";

/**
 * Product image with a branded fallback tile. 20 of the imported products have
 * no photo, so instead of showing a generic placeholder we render a subtle
 * brand tile carrying the product initials.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  loading,
}: {
  src: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}) {
  const initials = alt
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  if (!src) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <div className="text-center">
          <span className="block text-3xl font-black tracking-tight text-brand-300">
            {initials || "BC"}
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
            BCTLABS
          </span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={clsx("object-contain", className, imgClassName)}
    />
  );
}
