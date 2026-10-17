import "server-only";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

function isLocalOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return LOCAL_HOSTS.has(hostname) || hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

function firstForwarded(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

function normalise(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Resolve the public origin used for payment return URLs and webhooks.
 *
 * `APP_URL` wins when it points at a real host. In local development the
 * configured APP_URL is usually `http://localhost:4000`, so a forwarded
 * request origin (the HTTPS preview proxy) takes precedence over it.
 */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto =
    firstForwarded(request.headers.get("x-forwarded-proto"))?.toLowerCase() ??
    url.protocol.replace(/:$/, "");
  const host =
    firstForwarded(request.headers.get("x-forwarded-host")) ??
    request.headers.get("host") ??
    url.host;
  const requestOrigin = normalise(`${proto}://${host}`);

  const configured = process.env.APP_URL?.trim();
  if (configured && !isLocalOrigin(normalise(configured))) return normalise(configured);
  if (!isLocalOrigin(requestOrigin)) return requestOrigin;
  return configured ? normalise(configured) : requestOrigin;
}
