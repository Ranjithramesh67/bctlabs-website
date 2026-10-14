"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Minimal replacement for Bootstrap's `data-toggle="dropdown"` behaviour.
 * The legacy jQuery/Bootstrap bundle is not loaded in the Next.js app, so the
 * admin navbar drives its menus from React state and closes them on outside
 * clicks or Escape.
 *
 * The caller owns the ref (attached to the dropdown root) so this hook only
 * exposes render-safe state; returning the ref itself would trip the React
 * Compiler rule that forbids reading ref-backed objects during render.
 */
export function useDropdown<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, ref]);

  return { open, setOpen, toggle: () => setOpen((value) => !value) };
}
