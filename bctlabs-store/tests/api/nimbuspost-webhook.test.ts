import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const applyTrackingUpdate = vi.fn();

vi.mock("@/lib/shipments", () => ({
  applyTrackingUpdate: (...args: unknown[]) => applyTrackingUpdate(...args),
}));

import { POST } from "@/app/api/webhooks/nimbuspost/route";

const SECRET = "np_whsec_test";

function sign(body: string, encoding: "hex" | "base64" = "hex", secret = SECRET) {
  return createHmac("sha256", secret).update(body, "utf8").digest(encoding);
}

function webhookRequest(body: string, headers: Record<string, string>) {
  return new Request("http://localhost/api/webhooks/nimbuspost", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

const trackingPayload = JSON.stringify({
  order_number: "4391",
  awb_number: "AWB123456789",
  status: "out for delivery",
  status_code: "OFD",
  event_time: "2026-10-11 14:20:05",
});

describe("POST /api/webhooks/nimbuspost", () => {
  beforeEach(() => {
    process.env.NIMBUSPOST_WEBHOOK_SECRET = SECRET;
    applyTrackingUpdate.mockResolvedValue({ id: 1 });
  });

  afterEach(() => {
    delete process.env.NIMBUSPOST_WEBHOOK_SECRET;
    vi.clearAllMocks();
  });

  it("accepts a hex HMAC signature and applies the tracking update", async () => {
    const response = await POST(webhookRequest(trackingPayload, { "x-nimbus-signature": sign(trackingPayload) }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, updated: 1, ignored: 0 });
    expect(applyTrackingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ awbNumber: "AWB123456789", statusCode: "OFD", statusText: "out for delivery" }),
    );
  });

  it("accepts a base64 HMAC signature", async () => {
    const response = await POST(
      webhookRequest(trackingPayload, { "x-nimbus-signature": sign(trackingPayload, "base64") }),
    );
    expect(response.status).toBe(200);
  });

  it("rejects an unsigned payload", async () => {
    const response = await POST(webhookRequest(trackingPayload, {}));
    expect(response.status).toBe(401);
    expect(applyTrackingUpdate).not.toHaveBeenCalled();
  });

  it("rejects a signature made with another secret", async () => {
    const forged = sign(trackingPayload, "hex", "wrong_secret");
    const response = await POST(webhookRequest(trackingPayload, { "x-nimbus-signature": forged }));
    expect(response.status).toBe(401);
  });

  it("fails closed when no secret is configured", async () => {
    delete process.env.NIMBUSPOST_WEBHOOK_SECRET;
    const response = await POST(webhookRequest(trackingPayload, { "x-nimbus-signature": sign(trackingPayload) }));
    expect(response.status).toBe(503);
  });
});
