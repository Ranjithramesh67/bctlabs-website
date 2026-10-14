"use client";

import { useEffect, useState } from "react";

import type { FlashMessage } from "@/lib/admin/flash";

export function Flash({ flash }: { flash: FlashMessage | null }) {
  const [visible, setVisible] = useState(Boolean(flash));

  useEffect(() => {
    if (!flash) {
      return;
    }
    // Clear the one-shot flash cookie so it is not shown again.
    document.cookie = "admin_flash=; Max-Age=0; path=/";
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [flash]);

  if (!flash || !visible) {
    return null;
  }

  return (
    <div
      className={`alert alert-${flash.type === "error" ? "danger" : "success"}`}
      role="alert"
    >
      {flash.message}
    </div>
  );
}
