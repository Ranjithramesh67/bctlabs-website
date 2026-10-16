"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button, Input, Label } from "@/components/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.status === 401 || response.status === 403) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Unable to sign in. Please try again.");
        return;
      }

      if (!response.ok) {
        setError("Unable to sign in. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div>
        <Label htmlFor="admin-email">Email address</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Not a staff member?{" "}
        <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700">
          Return to the storefront
        </Link>
      </p>
    </form>
  );
}
