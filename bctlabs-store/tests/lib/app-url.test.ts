import { afterEach, describe, expect, it } from "vitest";

import { publicOrigin } from "@/lib/app-url";

function request(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

describe("publicOrigin", () => {
  afterEach(() => {
    delete process.env.APP_URL;
  });

  it("prefers a public APP_URL", () => {
    process.env.APP_URL = "https://shop.example.com/";
    expect(publicOrigin(request("http://localhost:4000/api/orders"))).toBe("https://shop.example.com");
  });

  it("uses the forwarded preview origin when APP_URL points at localhost", () => {
    process.env.APP_URL = "http://localhost:4000";
    const req = request("http://localhost:4000/api/orders", {
      "x-forwarded-host": "4000-abc.monkeycode-ai.live",
      "x-forwarded-proto": "https",
    });
    expect(publicOrigin(req)).toBe("https://4000-abc.monkeycode-ai.live");
  });

  it("uses forwarded headers when APP_URL is unset", () => {
    const req = request("http://localhost:4000/api/orders", {
      "x-forwarded-host": "shop.example.com",
      "x-forwarded-proto": "https",
    });
    expect(publicOrigin(req)).toBe("https://shop.example.com");
  });

  it("falls back to the request origin in local development", () => {
    expect(publicOrigin(request("http://localhost:4000/api/orders"))).toBe("http://localhost:4000");
  });

  it("takes the first value of comma separated forwarded headers", () => {
    const req = request("http://localhost:4000/api/orders", {
      "x-forwarded-host": "shop.example.com, internal.local",
      "x-forwarded-proto": "https, http",
    });
    expect(publicOrigin(req)).toBe("https://shop.example.com");
  });
});
