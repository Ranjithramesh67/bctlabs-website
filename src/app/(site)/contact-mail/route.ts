import { NextResponse } from "next/server";

import { validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validation/site";

export const instant = false;

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/** PHP `htmlspecialchars` (ENT_QUOTES). */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => null);
    return json && typeof json === "object"
      ? (json as Record<string, unknown>)
      : {};
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function buildHtmlContent(values: {
  name: string;
  email: string;
  subject: string;
  mobile: string;
  message: string;
}): string {
  const fromName = escapeHtml(values.name);
  const emailFrom = escapeHtml(values.email);
  const subject = escapeHtml(values.subject);
  const phone = escapeHtml(values.mobile);
  const message = escapeHtml(values.message).replace(/\r?\n/g, "<br />");

  return `
            <html><body>
            <h2>New Contact Form Submission</h2>
            <table style='width:100%; border-collapse:collapse; font-family:Arial, sans-serif;'>
                <tr><th style='border:1px solid #ddd; padding:10px;'>Name</th><td style='border:1px solid #ddd; padding:10px;'>${fromName}</td></tr>
                <tr><th style='border:1px solid #ddd; padding:10px;'>Email</th><td style='border:1px solid #ddd; padding:10px;'>${emailFrom}</td></tr>
                <tr><th style='border:1px solid #ddd; padding:10px;'>Phone</th><td style='border:1px solid #ddd; padding:10px;'>${phone}</td></tr>
                <tr><th style='border:1px solid #ddd; padding:10px;'>Subject</th><td style='border:1px solid #ddd; padding:10px;'>${subject}</td></tr>
                <tr><th style='border:1px solid #ddd; padding:10px;'>Message</th><td style='border:1px solid #ddd; padding:10px;'>${message}</td></tr>
            </table>
            </body></html>`;
}

/**
 * POST /contact-mail -> `FrontendController::contactMail`.
 *
 * Stores the message, then relays it to Brevo when `BREVO_API_KEY` is set. It
 * always returns a 200 success payload after a successful insert, matching the
 * original.
 */
export async function POST(request: Request) {
  const payload = await readPayload(request);
  const parsed = contactMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { name, email, subject, mobile, message } = parsed.data;

  try {
    await prisma.contact_messages.create({
      data: { name, email, subject, mobile, message },
    });
  } catch (error) {
    console.error("Contact message failed:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }

  const toEmail = process.env.MAIL_TO_EMAIL;
  const fromEmail = process.env.MAIL_FROM_EMAIL;
  const apiKey = process.env.BREVO_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(BREVO_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: escapeHtml(name), email: fromEmail },
          to: [{ email: toEmail, name: "BCT Labs" }],
          subject: "New Contact Form Submission - BCT Labs",
          htmlContent: buildHtmlContent({ name, email, subject, mobile, message }),
        }),
      });

      if (!response.ok) {
        console.error("Brevo Mail request failed:", response.status);
      }
    } catch (error) {
      console.error("Brevo Mail request error:", error);
    }
  } else {
    console.warn(
      "BREVO_API_KEY is not set; skipping contact notification email.",
    );
  }

  return NextResponse.json({
    success: true,
    message: "Message submitted successfully.",
  });
}
