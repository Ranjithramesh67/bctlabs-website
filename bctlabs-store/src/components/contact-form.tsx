"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";

type FieldErrors = { name?: string; email?: string; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email address.";
    if (!message.trim()) next.message = "Message is required.";
    else if (message.trim().length < 5) next.message = "Message must be at least 5 characters.";
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(data?.error ?? "Unable to send your message. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Thanks, we have your message.</h2>
          <p className="mt-1 text-sm text-slate-600">
            Our team will get back to you at <span className="font-semibold">{email.trim()}</span> within one
            business day.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName("");
            setEmail("");
            setPhone("");
            setSubject("");
            setMessage("");
            setErrors({});
            setFormError("");
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </div>
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
          <Label htmlFor="contact-name">Name *</Label>
          <Input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p> : null}
        </div>

        <div>
          <Label htmlFor="contact-email">Email *</Label>
          <Input
            id="contact-email"
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
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 90000 00000"
          />
        </div>

        <div>
          <Label htmlFor="contact-subject">Subject (optional)</Label>
          <Input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="How can we help?"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message">Message *</Label>
        <Textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what you need - product queries, bulk orders or technical support."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <p className="mt-1.5 text-xs text-rose-600">{errors.message}</p> : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
