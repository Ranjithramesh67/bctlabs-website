"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Label } from "./ui";

type FieldErrors = { email?: string; password?: string; firstName?: string; lastName?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    setFormError("");
    if (Object.keys(fieldErrors).length > 0) return;

    setPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error ?? "Unable to create your account. Please try again.");
        return;
      }
      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account");
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="register-first-name">First name</Label>
          <Input
            id="register-first-name"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="First name"
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName ? <p className="mt-1.5 text-xs text-rose-600">{errors.firstName}</p> : null}
        </div>

        <div>
          <Label htmlFor="register-last-name">Last name</Label>
          <Input
            id="register-last-name"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Last name"
            aria-invalid={Boolean(errors.lastName)}
          />
          {errors.lastName ? <p className="mt-1.5 text-xs text-rose-600">{errors.lastName}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="register-email">Email address</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p> : null}
      </div>

      <div>
        <Label htmlFor="register-phone">Phone (optional)</Label>
        <Input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p> : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
