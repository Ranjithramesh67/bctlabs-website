"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { t } from "@/lib/i18n";

type FieldErrors = Record<string, string[]>;

function invalidClass(errors: FieldErrors, field: string): string {
  return errors[field]?.length ? "form-control is-invalid" : "form-control";
}

function fieldFeedback(errors: FieldErrors, field: string): string | null {
  return errors[field]?.[0] ?? null;
}

/**
 * Faithful port of the `resources/views/auth/register.blade.php` form. Keeps
 * the original fields/markup and posts to the existing
 * `POST /api/auth/register` JSON endpoint, rendering the Laravel-style 422
 * `errors` object.
 */
export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    // NOTE: `profile_picture` cannot be sent here — the existing JSON endpoint
    // does not accept a file (see the parity gap documented in the port notes).
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        password_confirmation: formData.get("password_confirmation"),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      errors?: FieldErrors;
      redirect?: string;
    };

    if (!response.ok) {
      if (data.errors && Object.keys(data.errors).length > 0) {
        setErrors(data.errors);
      } else {
        setGeneralError(data.message ?? "Unable to register. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    router.push(data.redirect ?? "/admin/dashboard");
    router.refresh();
  }

  const errorList = Object.values(errors).flat();

  return (
    <form
      method="POST"
      action="/api/auth/register"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      {errorList.length > 0 ? (
        <div className="alert alert-danger p-0">
          <ul>
            {errorList.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {generalError ? (
        <div className="alert alert-danger p-0">
          <ul>
            <li>{generalError}</li>
          </ul>
        </div>
      ) : null}

      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="first_name">{t("register.first_name")}:</label>
            <span className="text-danger">*</span>
            <input
              id="firstName"
              type="text"
              className={invalidClass(errors, "first_name")}
              name="first_name"
              tabIndex={1}
              placeholder="Enter First Name"
              autoFocus
              required
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "first_name")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="last_name">{t("register.last_name")}:</label>
            <span className="text-danger">*</span>
            <input
              id="lastName"
              type="text"
              className={invalidClass(errors, "last_name")}
              name="last_name"
              tabIndex={1}
              placeholder="Enter Last name"
              required
              autoFocus
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "last_name")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="email">{t("register.email")}:</label>
            <span className="text-danger">*</span>
            <input
              id="email"
              type="email"
              className={invalidClass(errors, "email")}
              placeholder="Enter Email address"
              name="email"
              tabIndex={1}
              required
              autoFocus
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "email")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="phone">{t("register.phone")}:</label>
            <input
              id="phone"
              type="text"
              className={invalidClass(errors, "phone")}
              placeholder="Enter Phone Number"
              name="phone"
              tabIndex={1}
              autoFocus
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "phone")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="password" className="control-label">
              {t("register.password")}:
            </label>
            <span className="text-danger">*</span>
            <input
              id="password"
              type="password"
              className={invalidClass(errors, "password")}
              placeholder="Set account password"
              name="password"
              tabIndex={2}
              required
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "password")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="password_confirmation" className="control-label">
              {t("register.confirm_password")}:
            </label>
            <span className="text-danger">*</span>
            <input
              id="password_confirmation"
              type="password"
              placeholder="Confirm account password"
              className={invalidClass(errors, "password_confirmation")}
              name="password_confirmation"
              tabIndex={2}
            />
            <div className="invalid-feedback">
              {fieldFeedback(errors, "password_confirmation")}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="profile_picture" className="control-label">
              {t("register.profile_picture")}:
            </label>
            <div className="custom-file">
              <input
                type="file"
                name="profile_picture"
                className="custom-file-input"
                id="customFile"
              />
              <label className="custom-file-label" htmlFor="customFile">
                {t("register.choose")}
              </label>
            </div>
          </div>
        </div>
        <div className="col-md-12 mt-4">
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              tabIndex={4}
              disabled={submitting}
            >
              {t("register.register")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
