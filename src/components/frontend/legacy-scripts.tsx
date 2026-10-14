"use client";

import { useEffect, useRef } from "react";

const EMPTY: string[] = [];

// Shared across instances so jQuery and its plugins are only fetched once,
// even though the layout and a page can each mount `<LegacyScripts />`.
const inFlight = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = inFlight.get(src);
  if (existing) return existing;

  const request = new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    // A few legacy assets 404 (e.g. `isotope.pkgd.min.html`); parity keeps the
    // page working, so one failed plugin must not block the scripts after it.
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });

  inFlight.set(src, request);
  return request;
}

function runInline(code: string): void {
  const script = document.createElement("script");
  script.textContent = code;
  document.body.appendChild(script);
}

/**
 * Loads the legacy jQuery theme the way the Blade templates did, but only
 * after React has hydrated.
 *
 * The original `<script>` tags sat inside the server-rendered body, so jQuery
 * enhanced the DOM (meanmenu, WOW, Swiper, …) before React hydrated. React
 * then treated those enhancements as hydration mismatches and regenerated the
 * tree, discarding them. Deferring the load until after hydration keeps React
 * the sole owner of the initial DOM, so nothing is regenerated.
 *
 * The vendored `script.js` also registers a `DOMContentLoaded` listener (the
 * `mySlides` slideshow). Since that event has already fired by the time these
 * scripts load, the layout replays it via `replayContentLoaded` after loading.
 */
export default function LegacyScripts({
  src = EMPTY,
  inline = EMPTY,
  replayContentLoaded = false,
}: {
  src?: string[];
  inline?: string[];
  replayContentLoaded?: boolean;
}) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      for (const url of src) {
        await loadScript(url);
      }

      for (const code of inline) {
        runInline(code);
      }

      // `script.js` initialises its slideshow on `DOMContentLoaded`, which has
      // already fired, so replay it for the vendored handlers.
      if (replayContentLoaded) {
        document.dispatchEvent(new Event("DOMContentLoaded"));
      }
    })();
  }, [src, inline, replayContentLoaded]);

  return null;
}
