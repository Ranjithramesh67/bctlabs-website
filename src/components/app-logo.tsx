"use client";

import { useState } from "react";

/**
 * Bundled logo used when the configured logo is missing or its (often legacy,
 * external) URL fails to load. Mirrors `getAppLogo() ?? asset('img/infyom-logo.png')`.
 */
export const FALLBACK_LOGO = "/img/infyom-logo.png";

type Props = {
  src?: string | null;
  alt?: string;
  width?: number;
  className?: string;
};

/**
 * App/brand logo. The original Blade echoed the stored `logo` setting directly,
 * so a stale URL rendered a broken image; this component swaps to the bundled
 * logo when that happens.
 */
export function AppLogo({ src, alt = "logo", width, className }: Props) {
  const initial = src && src.trim() ? src : FALLBACK_LOGO;
  const [current, setCurrent] = useState(initial);

  return (
    <img
      src={current}
      alt={alt}
      width={width}
      className={className}
      onError={() => {
        if (current !== FALLBACK_LOGO) {
          setCurrent(FALLBACK_LOGO);
        }
      }}
    />
  );
}
