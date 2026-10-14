import type { ImgHTMLAttributes } from "react";

// Next's on-demand image optimizer only accepts widths from this set.
const ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];

function nearestWidth(width: number): number {
  return ALLOWED_WIDTHS.reduce(
    (best, candidate) =>
      Math.abs(candidate - width) < Math.abs(best - width) ? candidate : best,
    640,
  );
}

/**
 * Build a `/_next/image` URL so the asset is resized, converted to
 * WebP/AVIF and cached on demand. Falls back to the raw path for non-local
 * sources (nothing else is used in this app).
 */
export function optimizedImageSrc(
  src: string,
  targetWidth: number,
  quality = 75,
): string {
  if (!src.startsWith("/") || src === "/") return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${nearestWidth(targetWidth)}&q=${quality}`;
}

type SiteImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** Roughly how wide the image is rendered, in CSS pixels (before DPR). */
  targetWidth: number;
  quality?: number;
  /** Above-the-fold images should load eagerly. */
  priority?: boolean;
};

/**
 * A plain `<img>` whose source goes through Next's image optimizer. Keeps the
 * exact element/markup shape of the original Blade templates while cutting the
 * transferred bytes roughly tenfold for the legacy camera-resolution assets.
 */
export function SiteImage({
  src,
  targetWidth,
  quality = 75,
  priority = false,
  alt = "",
  ...rest
}: SiteImageProps) {
  return (
    <img
      src={optimizedImageSrc(src, targetWidth, quality)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      alt={alt}
      {...rest}
    />
  );
}
