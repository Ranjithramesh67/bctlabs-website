"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("signup failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white">
        Thanks, you are on the list. Watch your inbox for new arrivals and restock alerts.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:bg-white/15 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "pending"}
        className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-800 transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {status === "pending" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-sm text-rose-200 sm:hidden">
          Could not subscribe. Please try again.
        </p>
      ) : null}
    </form>
  );
}
