"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { t } from "@/lib/i18n";

type LoginFormProps = {
  intended?: string;
};

/**
 * Faithful port of the `resources/views/auth/login.blade.php` form. The
 * original posts a classic synchronous form; this port keeps the existing
 * `POST /api/auth/login` JSON endpoint and its redirect/disabled-account
 * behaviour.
 */
export function LoginForm({ intended }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        intended: intended ?? null,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      redirect?: string;
    };

    if (!response.ok) {
      setError(data.message ?? "Unable to sign in. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push(data.redirect ?? "/admin/dashboard");
    // Re-render the destination on the server with the new session cookie.
    router.refresh();
  }

  return (
    <form method="POST" action="/api/auth/login" onSubmit={handleSubmit}>
      {/* Preserved for the no-JS native submit path (Laravel's intended URL). */}
      {intended ? <input type="hidden" name="intended" value={intended} /> : null}
      {error ? (
        <div className="alert alert-danger">
          <ul className="mb-0">
            <li>{error}</li>
          </ul>
        </div>
      ) : null}

      <div className="form-group">
        <label htmlFor="email">{t("login.email")}:</label>
        <span className="text-danger">*</span>
        <input
          aria-describedby="emailHelpBlock"
          id="email"
          type="email"
          name="email"
          className="form-control"
          placeholder="Enter Email"
          tabIndex={1}
          autoFocus
          required
        />
        <div className="invalid-feedback"></div>
      </div>

      <div className="form-group">
        <input
          aria-describedby="passwordHelpBlock"
          id="password"
          type="password"
          name="password"
          className="form-control"
          placeholder="Enter Password"
          tabIndex={2}
          required
        />
        <div className="invalid-feedback"></div>
      </div>

      <div className="form-group">
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block"
          tabIndex={4}
          disabled={submitting}
        >
          {t("login.login")}
        </button>
      </div>
    </form>
  );
}
