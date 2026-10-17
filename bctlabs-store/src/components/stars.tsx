"use client";

import { useId } from "react";
import { clsx } from "clsx";

/** Star rating, rounded to the nearest half star. */
export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  const id = useId();
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
                    <linearGradient id={`${id}-half-${star}`}>
                      <stop offset="50%" stopColor="#ff934c" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
                    fill={`url(#${id}-half-${star})`}
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
