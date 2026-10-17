"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { safeRedirect } from "@/lib/redirect";
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
  const [step, setStep] = useState<"details" | "verify">("details");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");

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
      const data = (await response.json().catch(() => null)) as
        | { requiresVerification?: boolean; delivered?: boolean; devCode?: string; email?: string }
        | null;

      if (data?.requiresVerification) {
        setDelivered(data.delivered !== false);
        setDevCode(data.devCode ?? null);
        setNotice(
          data.delivered === false
            ? "Email delivery is not configured on this environment. Use the code shown below."
            : `We sent a 6 digit code to ${data.email ?? email.trim()}. It expires in 10 minutes.`,
        );
        setStep("verify");
        return;
      }

      router.push(safeRedirect(redirectTo));
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    if (!/^\d{6}$/.test(code.trim())) {
      setFormError("Enter the 6 digit code from your email.");
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error ?? "We could not verify that code. Please try again.");
        return;
      }
      router.push(safeRedirect(redirectTo));
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function resendCode() {
    setFormError("");
    setNotice("");
    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; delivered?: boolean; devCode?: string }
        | null;
      if (!response.ok) {
        setFormError(data?.error ?? "Could not resend the code. Please try again.");
        return;
      }
      setDelivered(data?.delivered !== false);
      setDevCode(data?.devCode ?? null);
      setNotice("A new code is on its way. Enter the latest code below.");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setResending(false);
    }
  }

  if (step === "verify") {
    return (
      <form onSubmit={verifyCode} noValidate className="space-y-5">
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p className="font-semibold">Verify your email</p>
          <p className="mt-1 text-brand-800">
            Enter the 6 digit code sent to <span className="font-semibold">{email.trim()}</span>.
          </p>
        </div>

        {notice ? (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {devCode ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
            Test mode code: <span className="font-mono text-base font-bold tracking-widest">{devCode}</span>
            {!delivered ? " (no email was sent)" : ""}
          </p>
        ) : null}
        {formError ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {formError}
          </p>
        ) : null}

        <div>
          <Label htmlFor="register-code">Verification code</Label>
          <Input
            id="register-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center text-lg font-bold tracking-[0.5em]"
          />
        </div>

        <Button type="submit" size="lg" disabled={verifying || resending} className="w-full">
          {verifying ? "Verifying..." : "Verify email and create account"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            onClick={resendCode}
            disabled={resending || verifying}
            className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setCode("");
              setFormError("");
              setNotice("");
            }}
            className="font-medium text-slate-500 hover:text-slate-700"
          >
            Change details
          </button>
        </div>
      </form>
    );
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
