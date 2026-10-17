"use client";

import { useState } from "react";
import { clsx } from "clsx";

/**
 * WooCommerce-style product gallery: a large main image plus clickable thumbnails.
 * Thumbnails are real <button> elements, so they are keyboard accessible out of the box.
 */
export function ProductGallery({
  name,
  image,
  gallery,
}: {
  name: string;
  image: string | null;
  gallery: string[];
}) {
  // Keep the featured image first, then the gallery, without duplicates or nulls.
  const images = Array.from(new Set([image, ...gallery].filter((src): src is string => Boolean(src))));
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="1.5" />
            <path d="M21 15l-4.5-4.5L7 20" />
          </svg>
          <p className="mt-3 text-sm font-medium text-slate-400">No image available</p>
        </div>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <img src={current} alt={name} className="h-full w-full object-contain p-6" />
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap gap-3" role="group" aria-label={`${name} image thumbnails`}>
          {images.map((src, index) => {
            const isActive = index === active;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={isActive}
                className={clsx(
                  "h-16 w-16 overflow-hidden rounded-xl border bg-white p-1.5 transition-all sm:h-20 sm:w-20",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                  isActive
                    ? "border-brand-500 ring-1 ring-brand-500"
                    : "border-slate-200 hover:border-brand-300",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-contain" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
