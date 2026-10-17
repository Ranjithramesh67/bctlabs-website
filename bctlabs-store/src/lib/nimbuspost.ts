import "server-only";

/**
 * NimbusPost logistics client.
 *
 * Credentials and warehouse settings come from the environment, never from
 * hardcoded values:
 *   NIMBUSPOST_API_KEY             - key id (`npk_...`) from Settings -> API Keys
 *   NIMBUSPOST_API_SECRET          - secret paired with that key id
 *   NIMBUSPOST_EMAIL/PASSWORD      - fallback: log in for a bearer token
 *   NIMBUSPOST_BASE_URL            - defaults to https://api-v2.nimbuspost.com
 *   ORIGIN_PINCODE_BLR / _ARK      - per-warehouse origin pincodes
 *   NIMBUSPOST_ORIGIN_PINCODE      - legacy single-warehouse origin pincode
 *   NIMBUSPOST_DEFAULT_WAREHOUSE   - BLR | ARK (default ARK)
 *   NIMBUSPOST_PICKUP_WAREHOUSE_ID - pickup warehouse id (required to book)
 *   NIMBUSPOST_WEBHOOK_SECRET      - HMAC secret for the tracking webhook
 *
 * Serviceability is always answered by the live API: no pincode list is kept
 * anywhere in this codebase.
 */

const DEFAULT_BASE_URL = "https://api-v2.nimbuspost.com";

export type PaymentType = "COD" | "PREPAID";

export type WarehouseCode = "BLR" | "ARK";

export type NimbusPostError = {
  statusCode: number;
  message: string;
  details?: unknown;
};

export class NimbusPostApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor({ statusCode, message, details }: NimbusPostError) {
    super(message);
    this.name = "NimbusPostApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isNimbusPostConfigured(): boolean {
  const hasKeyPair = Boolean(process.env.NIMBUSPOST_API_KEY && process.env.NIMBUSPOST_API_SECRET);
  const hasLogin = Boolean(process.env.NIMBUSPOST_EMAIL && process.env.NIMBUSPOST_PASSWORD);
  if (!hasKeyPair && !hasLogin) {
    return false;
  }
  return Boolean(originPincode("BLR") || originPincode("ARK"));
}

/**
 * Origin pincode for a warehouse, supplied by the operator via env.
 * Falls back to the legacy single-origin variable when a per-warehouse value
 * is not configured.
 */
export function originPincode(warehouse: WarehouseCode = defaultWarehouse()): string {
  const specific = warehouse === "BLR" ? process.env.ORIGIN_PINCODE_BLR : process.env.ORIGIN_PINCODE_ARK;
  return (specific ?? process.env.NIMBUSPOST_ORIGIN_PINCODE ?? "").trim();
}

export function defaultWarehouse(): WarehouseCode {
  const configured = (process.env.NIMBUSPOST_DEFAULT_WAREHOUSE ?? "ARK").trim().toUpperCase();
  return configured === "BLR" ? "BLR" : "ARK";
}

export function isWarehouseCode(value: unknown): value is WarehouseCode {
  return value === "BLR" || value === "ARK";
}

export type Warehouse = {
  code: WarehouseCode;
  name: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  warehouseId: string;
};

/**
 * Pickup address for a warehouse. Every field is overridable via
 * `NIMBUSPOST_<CODE>_*`; the ARK defaults mirror the brand's registered
 * address, BLR defaults to the Bangalore city warehouse.
 */
export function warehouse(code: WarehouseCode): Warehouse {
  const isBlr = code === "BLR";
  const fallback = isBlr
    ? {
        name: "BCTLABS Bangalore",
        address: "Bangalore",
        address2: "",
        city: "Bangalore",
        state: "Karnataka",
      }
    : {
        name: "BCTLABS",
        address: "5/3, Nehruji 8th Street",
        address2: "Arakkonam, Vellore",
        city: "Arakkonam",
        state: "Tamil Nadu",
      };
  const prefix = `NIMBUSPOST_${code}_`;
  return {
    code,
    name: process.env[`${prefix}NAME`] || fallback.name,
    address: process.env[`${prefix}ADDRESS`] || fallback.address,
    address2: process.env[`${prefix}ADDRESS_2`] ?? fallback.address2,
    city: process.env[`${prefix}CITY`] || fallback.city,
    state: process.env[`${prefix}STATE`] || fallback.state,
    pincode: originPincode(code),
    phone: process.env[`${prefix}PHONE`] || process.env.NIMBUSPOST_PICKUP_PHONE || "+91 95431 00296",
    email: process.env[`${prefix}EMAIL`] || process.env.NIMBUSPOST_PICKUP_EMAIL || "bctlabs@gmail.com",
    warehouseId: process.env[`${prefix}WAREHOUSE_ID`] || process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID || "",
  };
}

/**
 * Parcel weight assumed per order line when the product has no weight of its
 * own. Configurable because it directly changes the quoted freight.
 */
export function defaultItemWeightGrams(): number {
  const value = Number(process.env.NIMBUSPOST_DEFAULT_ITEM_WEIGHT_GRAMS ?? 500);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 500;
}

function baseUrl(): string {
  return (process.env.NIMBUSPOST_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Partner API v2 authenticates with the key pair; the legacy API used a
 * bearer token. Returns headers for whichever credential is configured.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const apiKey = process.env.NIMBUSPOST_API_KEY;
  const apiSecret = process.env.NIMBUSPOST_API_SECRET;
  if (apiKey && apiSecret) {
    return { "x-api-key": apiKey, "x-api-secret": apiSecret };
  }

  const email = process.env.NIMBUSPOST_EMAIL;
  const password = process.env.NIMBUSPOST_PASSWORD;
  if (!email || !password) {
    throw new NimbusPostApiError({
      statusCode: 503,
      message:
        "NimbusPost is not configured. Set NIMBUSPOST_API_KEY and NIMBUSPOST_API_SECRET in the environment.",
    });
  }
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return { Authorization: `Bearer ${cachedToken.token}` };
  }

  const response = await fetch(`${baseUrl()}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const payload = await readJson(response);
  const body = asRecord(payload);
  if (!response.ok || body?.status === false) {
    throw new NimbusPostApiError({
      statusCode: response.status === 200 ? 502 : response.status,
      message: "Could not authenticate with NimbusPost. Check NIMBUSPOST_EMAIL/PASSWORD.",
      details: payload,
    });
  }
  const data = body?.data;
  const token = typeof data === "string" ? data : asRecord(data)?.token;
  if (typeof token !== "string") {
    throw new NimbusPostApiError({ statusCode: 502, message: "NimbusPost login returned no token.", details: payload });
  }
  cachedToken = { token, expiresAt: Date.now() + 20 * 60 * 60 * 1000 };
  return { Authorization: `Bearer ${token}` };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...headers,
    },
    cache: "no-store",
  });
  const payload = await readJson(response);
  const body = asRecord(payload);
  const envelopeError = asRecord(body?.error);
  if (!response.ok || body?.status === false || body?.success === false) {
    throw new NimbusPostApiError({
      statusCode: response.ok ? 502 : response.status,
      message:
        (typeof envelopeError?.detail === "string" && envelopeError.detail) ||
        (typeof body?.message === "string" && body.message) ||
        `NimbusPost request failed (${response.status})`,
      details: payload,
    });
  }
  return payload as T;
}

// ---------------------------------------------------------------------------
// Serviceability
// ---------------------------------------------------------------------------

export type ServiceabilityOption = {
  courierId: string | null;
  courierCode: string;
  courierName: string;
  freight: number;
  codCharges: number;
  total: number;
  estimatedDeliveryDays: string;
  tatDays: number | null;
  raw: Record<string, unknown>;
};

export type ServiceabilityQuery = {
  destinationPincode: string;
  weightGrams: number;
  paymentType: PaymentType;
  codAmount?: number;
  /** Pickup warehouse; defaults to NIMBUSPOST_DEFAULT_WAREHOUSE. */
  originWarehouse?: WarehouseCode;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

function firstNumber(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Paise are the API's unit; the storefront quotes rupees. */
function paiseToRupees(value: number | null): number {
  return value === null ? 0 : Math.round(value) / 100;
}

function normalizeQuote(row: Record<string, unknown>): ServiceabilityOption | null {
  const courierName =
    firstString(row, ["courierDisplayName", "courierName"]) || firstString(row, ["courierCode"]);
  if (!courierName) return null;

  const rate = asRecord(row.result) ?? {};
  const freight = paiseToRupees(firstNumber(rate, ["shippingChargesPaise"]));
  const codCharges = paiseToRupees(firstNumber(rate, ["codChargesPaise"]));
  const quotedTotal = firstNumber(rate, ["totalPaise"]);
  const tatDays = firstNumber(row, ["tatDays"]);

  return {
    courierId: firstString(row, ["courierId"]) || null,
    courierCode: firstString(row, ["courierCode"]),
    courierName,
    freight,
    codCharges,
    total: quotedTotal === null ? freight + codCharges : paiseToRupees(quotedTotal),
    estimatedDeliveryDays:
      tatDays === null ? "" : tatDays === 0 ? "Same day" : `${Math.trunc(tatDays)} day${tatDays === 1 ? "" : "s"}`,
    tatDays: tatDays === null ? null : Math.trunc(tatDays),
    raw: row,
  };
}

/**
 * Ask the live NimbusPost API which couriers serve `destinationPincode`.
 * Returns an empty array when no courier covers the route.
 */
export async function checkServiceability(query: ServiceabilityQuery): Promise<ServiceabilityOption[]> {
  const origin = originPincode(query.originWarehouse ?? defaultWarehouse());
  if (!origin) {
    throw new NimbusPostApiError({
      statusCode: 503,
      message: "Logistics is not configured. Set ORIGIN_PINCODE_BLR / ORIGIN_PINCODE_ARK in the environment.",
    });
  }

  const payload = await request("/v2/serviceability", {
    method: "POST",
    body: JSON.stringify({
      pickupPincode: origin,
      deliveryPincode: query.destinationPincode,
      paymentMode: query.paymentType.toLowerCase(),
      packages: [
        {
          weight: query.weightGrams,
          length: query.lengthCm ?? 20,
          width: query.widthCm ?? 15,
          height: query.heightCm ?? 10,
        },
      ],
      orderValuePaise: Math.round(Math.max(0, query.codAmount ?? 0) * 100),
    }),
  });
  const data = asRecord(asRecord(payload)?.data) ?? {};
  const available = Array.isArray(data.available) ? data.available : [];
  return available
    .filter((row): row is Record<string, unknown> => Boolean(asRecord(row)))
    .map(normalizeQuote)
    .filter((option): option is ServiceabilityOption => option !== null)
    .sort((a, b) => a.total - b.total);
}

/** Cheapest option by total freight + COD charge. */
export function cheapestOption(options: ServiceabilityOption[]): ServiceabilityOption | null {
  if (!options.length) return null;
  return options.reduce((best, option) => (option.total < best.total ? option : best));
}

// ---------------------------------------------------------------------------
// Shipment creation
// ---------------------------------------------------------------------------

export type AddressPayload = {
  name: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
};

export type CreateShipmentInput = {
  orderNumber: string;
  paymentType: PaymentType;
  orderAmount: number;
  codAmount?: number;
  weightGrams: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
  consignee: AddressPayload;
  courierId?: string | null;
  items?: { name: string; qty: number; price: number; sku?: string }[];
  warehouseId?: string;
  warehouseName?: string;
  warehouseAddress?: AddressPayload;
};

export type CreatedShipment = {
  shipmentId: string | null;
  awbNumber: string;
  courierName: string;
  courierId: string | null;
  freight: number | null;
  labelUrl: string | null;
  raw: unknown;
};

export async function createShipment(input: CreateShipmentInput): Promise<CreatedShipment> {
  // The pickup warehouse is registered with NimbusPost (its contact phone is
  // OTP-verified there), so booking references it by id rather than resending
  // the address.
  const warehouseId = input.warehouseId || process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID || "";
  if (!warehouseId) {
    throw new NimbusPostApiError({
      statusCode: 503,
      message:
        "Add a pickup warehouse in the NimbusPost dashboard, then set NIMBUSPOST_PICKUP_WAREHOUSE_ID.",
    });
  }

  const cod = input.paymentType === "COD";
  const items = input.items?.length
    ? input.items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: Number(item.price.toFixed(2)),
        ...(item.sku ? { sku: item.sku } : {}),
      }))
    : [{ name: `Order ${input.orderNumber}`, qty: 1, price: Number(input.orderAmount.toFixed(2)) }];

  const payload: Record<string, unknown> = {
    order_number: input.orderNumber,
    order_type: "b2c",
    payment_mode: cod ? "cod" : "prepaid",
    ...(cod ? { order_collectable_amount: Number((input.codAmount ?? input.orderAmount).toFixed(2)) } : {}),
    warehouse_id: warehouseId,
    shipping_address: {
      name: input.consignee.name,
      ...(input.consignee.email ? { email: input.consignee.email } : {}),
      address: input.consignee.address,
      address_opt: input.consignee.address2 ?? "",
      pincode: Number(input.consignee.pincode),
      city: input.consignee.city,
      state: input.consignee.state,
      country: "India",
      phone: Number(input.consignee.phone.replace(/\D/g, "").slice(-10)),
    },
    items,
    package: {
      weight: Number((input.weightGrams / 1000).toFixed(3)),
      length: input.lengthCm ?? 20,
      width: input.breadthCm ?? 15,
      height: input.heightCm ?? 10,
    },
  };

  // Passing courier_id pins the cheapest quoted courier; without it NimbusPost
  // auto-allocates its top-ranked serviceable courier.
  if (input.courierId) payload.courier_id = input.courierId;

  const response = await request("/v2/shipments", { method: "POST", body: JSON.stringify(payload) });
  const data = asRecord(asRecord(response)?.data) ?? {};
  const booking = asRecord(data.booking) ?? data;
  const awbNumber = firstString(booking, ["awb", "awb_number", "awbNumber"]);

  if (!awbNumber) {
    throw new NimbusPostApiError({
      statusCode: 502,
      message: "NimbusPost did not return an AWB number for this shipment.",
      details: response,
    });
  }

  return {
    shipmentId: firstString(booking, ["order_id", "shipment_id", "id"]) || null,
    awbNumber,
    courierName: firstString(booking, ["courier_name", "courierName", "courier_code"]),
    courierId: firstString(booking, ["courier_id", "courierId"]) || input.courierId || null,
    freight: firstNumber(asRecord(booking.price) ?? {}, ["total"]),
    labelUrl: firstString(booking, ["label_url", "labelUrl"]) || null,
    raw: response,
  };
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/**
 * Generate one manifest PDF for a set of AWBs from the same courier.
 * NimbusPost returns either a direct PDF URL or an object containing one.
 */
export async function generateManifest(
  awbNumbers: string[],
): Promise<{ pdfUrl: string | null; raw: unknown }> {
  if (!awbNumbers.length) {
    throw new NimbusPostApiError({ statusCode: 400, message: "At least one AWB is required." });
  }

  const response = await request("/v2/manifests", {
    method: "POST",
    body: JSON.stringify({ awbs: awbNumbers }),
  });

  const data = asRecord(asRecord(response)?.data) ?? {};
  const candidate = firstString(data, ["manifest_url", "pdf_url", "url"]);
  return { pdfUrl: candidate || null, raw: response };
}

// ---------------------------------------------------------------------------
// Tracking status mapping
// ---------------------------------------------------------------------------

export const SHIPMENT_STATUSES = [
  "CREATED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RTO_IN_TRANSIT",
  "RTO_DELIVERED",
  "CANCELLED",
  "EXCEPTION",
  "UNKNOWN",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

/**
 * Map a NimbusPost status/code string onto our ENUM.
 *
 * NimbusPost sends human labels ("Out for delivery", "Delivered") as well as
 * machine codes ("OFD", "DELIVERED_TO_CONSIGNEE"), so normalise to a token and
 * match on that. Anything unrecognised becomes UNKNOWN rather than being
 * silently dropped.
 */
export function mapTrackingStatus(input: string | null | undefined): ShipmentStatus {
  if (!input) return "UNKNOWN";
  const token = input
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");

  if (!token) return "UNKNOWN";

  // "DELIVERY_FAILED", "NOT_DELIVERED" and "UNDELIVERED" all contain
  // "DELIVER", so failures must be classified before the delivered branch.
  if (token.includes("RTO") && token.includes("DELIVER")) return "RTO_DELIVERED";
  if (
    token.includes("UNDELIVER") ||
    token.includes("NOT_DELIVERED") ||
    token.includes("DELIVERY_FAILED") ||
    token.includes("FAILED") ||
    token.includes("EXCEPTION") ||
    token === "NDR" ||
    token.includes("HOLD") ||
    token.includes("ADDRESS")
  ) {
    return "EXCEPTION";
  }
  if (token.includes("RTO")) return "RTO_IN_TRANSIT";
  if (token === "OFD" || token.includes("OUT_FOR_DELIVERY") || token.includes("OUT_FOR_DELIVRY")) {
    return "OUT_FOR_DELIVERY";
  }
  if (token.includes("DELIVERED") || token === "DELIVER") return "DELIVERED";
  if (token.includes("CANCEL")) return "CANCELLED";
  if (token.includes("PICKED") || token === "PICKUP_DONE" || token === "PICKED_UP") return "PICKED_UP";
  if (token.includes("PICKUP") || token.includes("MANIFEST") || token.includes("READY_FOR_PICKUP")) {
    return "PICKUP_SCHEDULED";
  }
  if (
    token.includes("TRANSIT") ||
    token.includes("SHIPPED") ||
    token.includes("DISPATCH") ||
    token.includes("REACHED") ||
    token.includes("HUB") ||
    token.includes("BAGGED") ||
    token.includes("CONNECTED")
  ) {
    return "IN_TRANSIT";
  }
  if (token.includes("CREATED") || token.includes("BOOKED") || token.includes("NEW")) return "CREATED";
  return "UNKNOWN";
}
