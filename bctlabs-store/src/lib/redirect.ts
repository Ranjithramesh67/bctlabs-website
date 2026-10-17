/** Only allow same-origin, absolute-path redirects (blocks `//evil.example`). */
export function safeRedirect(value: string | null | undefined, fallback = "/account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
