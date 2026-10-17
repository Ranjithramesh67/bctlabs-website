#!/usr/bin/env node
/**
 * Verify Cashfree Payment Gateway credentials without creating an order.
 *
 * Usage:
 *   node scripts/check-cashfree.mjs [appId] [secretKey]
 *   # or read CASHFREE_APP_ID / CASHFREE_SECRET_KEY from .env / the environment
 *
 * A GET for a non-existent order returns 404 once the credentials are valid and
 * 401 "authenticationFailed" when they are not, so no billable call is made.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function loadEnv() {
  try {
    const path = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^"(.*)"$/, "$1");
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
  } catch {
    // No .env file: fall back to the process environment.
  }
}

loadEnv();

const appId = (process.argv[2] ?? process.env.CASHFREE_APP_ID ?? "").trim();
const secretKey = (process.argv[3] ?? process.env.CASHFREE_SECRET_KEY ?? "").trim();
const env = (process.env.CASHFREE_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
const base = env === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

if (!appId || !secretKey) {
  console.error("Missing credentials. Pass them as arguments or set CASHFREE_APP_ID / CASHFREE_SECRET_KEY.");
  process.exit(2);
}

const response = await fetch(`${base}/orders/cf_credential_probe`, {
  headers: {
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": process.env.CASHFREE_API_VERSION || "2023-08-01",
  },
});
const body = await response.text();

if (response.status === 401 || response.status === 403) {
  console.error(`${env}: REJECTED (${response.status}) ${body.slice(0, 200)}`);
  console.error("These are not Payment Gateway credentials. Payouts keys are a different product.");
  process.exit(1);
}

if (response.status === 404) {
  console.log(`${env}: OK - credentials accepted (probe order not found, as expected).`);
  process.exit(0);
}

console.log(`${env}: unexpected response ${response.status} ${body.slice(0, 200)}`);
process.exit(1);
