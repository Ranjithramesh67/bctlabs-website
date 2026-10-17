import "server-only";

/**
 * NimbusPost logistics client.
 *
 * Credentials and warehouse settings come from the environment, never from
 * hardcoded values:
 *   NIMBUSPOST_API_KEY             - API key from the NimbusPost dashboard
 *   NIMBUSPOST_EMAIL/PASSWORD      - fallback: log in for a bearer token
 *   NIMBUSPOST_BASE_URL            - defaults to https://api.nimbuspost.com/v1
 *   NIMBUSPOST_ORIGIN_PINCODE      - warehouse pincode shipments start from
 *   NIMBUSPOST_PICKUP_WAREHOUSE_ID - optional warehouse id for pickup
 *   NIMBUSPOST_WEBHOOK_SECRET      - optional shared secret for the webhook
 *
 * Serviceability is always answered by the live API: no pincode list is kept
 * anywhere in this codebase.
 */

const DEFAULT_BASE_URL = "https://api.nimbuspost.com/v1";

export type PaymentType = "COD" | "PREPAID";

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
  if (!process.env.NIMBUSPOST_API_KEY && !(process.env.NIMBUSPOST_EMAIL && process.env.NIMBUSPOST_PASSWORD)) {
    return false;
  }
  return Boolean(originPincode());
}

/** Warehouse origin pincode, supplied by the operator via env. */
export function originPincode(): string {
  return (process.env.NIMBUSPOST_ORIGIN_PINCODE ?? "").trim();
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
 * Resolve the bearer token. An explicit API key wins; otherwise the operator
 * can supply dashboard credentials and we log in (cached for 20 hours).
 */
async function authToken(): Promise<string> {
  const apiKey = process.env.NIMBUSPOST_API_KEY;
  if (apiKey) return apiKey;

  const email = process.env.NIMBUSPOST_EMAIL;
  const password = process.env.NIMBUSPOST_PASSWORD;
  if (!email || !password) {
    throw new NimbusPostApiError({
      statusCode: 503,
      message: "NimbusPost is not configured. Set NIMBUSPOST_API_KEY in the environment.",
    });
  }
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

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
  return token;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

/**
 * NimbusPost accepts the API key either as `Authorization: Bearer <key>` or as
 * a raw `Authorization: <key>` depending on the account/API version. Start
 * with Bearer and fall back once, then remember what worked.
 */
let authScheme: "bearer" | "raw" = "bearer";

function send(
  path: string,
  init: RequestInit,
  token: string,
  scheme: "bearer" | "raw" = authScheme,
): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: scheme === "bearer" ? `Bearer ${token}` : token,
    },
    cache: "no-store",
  });
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await authToken();
  let response = await send(path, init, token);
  let payload = await readJson(response);

  if (authScheme === "bearer" && (response.status === 401 || response.status === 403)) {
    const retry = await send(path, init, token, "raw");
    if (retry.ok) {
      authScheme = "raw";
      response = retry;
      payload = await readJson(response);
    }
  }

  const body = asRecord(payload);
  if (!response.ok || body?.status === false) {
    throw new NimbusPostApiError({
      statusCode: response.ok ? 502 : response.status,
      message:
        (typeof body?.message === "string" && body.message) || `NimbusPost request failed (${response.status})`,
      details: payload,
    });
  }
  return payload as T;
}

// ---------------------------------------------------------------------------
// Serviceability
// ---------------------------------------------------------------------------

export type ServiceabilityOption = {
  courierId: number | null;
  courierName: string;
  freight: number;
  codCharges: number;
  total: number;
  estimatedDeliveryDays: string;
  raw: Record<string, unknown>;
};

export type ServiceabilityQuery = {
  destinationPincode: string;
  weightGrams: number;
  paymentType: PaymentType;
  codAmount?: number;
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

/** NimbusPost has returned several envelope shapes over API versions; accept all. */
function extractCarriers(payload: unknown): Record<string, unknown>[] {
  const envelope = asRecord(payload);
  const data = envelope?.data ?? payload;
  if (Array.isArray(data)) return data.filter((row): row is Record<string, unknown> => Boolean(asRecord(row)));
  const nested = asRecord(data);
  if (!nested) return [];
  for (const key of ["couriers", "available_courier_companies"]) {
    const list = nested[key];
    if (Array.isArray(list)) return list.filter((row): row is Record<string, unknown> => Boolean(asRecord(row)));
  }
  const deep = Object.values(nested).find(
    (value) => Array.isArray(value) && value.length > 0 && Boolean(asRecord(value[0])),
  );
  if (Array.isArray(deep)) return deep.filter((row): row is Record<string, unknown> => Boolean(asRecord(row)));
  return [];
}

function normalizeCarrier(row: Record<string, unknown>): ServiceabilityOption | null {
  const courierName =
    firstString(row, ["courier_name", "name", "courier_company", "courierName"]) ||
    firstString(row, ["courier", "service_name"]);
  if (!courierName) return null;

  const courierId = firstNumber(row, ["courier_id", "id", "courierId", "courier_company_id"]);
  const freight =
    firstNumber(row, ["freight_charges", "freight", "rate", "total_charges", "shipping_charges", "charge"]) ?? 0;
  const codCharges = firstNumber(row, ["cod_charges", "cod_charge", "cod"]) ?? 0;
  const days = firstString(row, [
    "estimated_delivery_days",
    "estimated_delivery",
    "delivery_time",
    "tat",
    "expected_delivery_days",
  ]);

  return {
    courierId: courierId === null ? null : Math.trunc(courierId),
    courierName,
    freight,
    codCharges,
    total: freight + codCharges,
    estimatedDeliveryDays: days,
    raw: row,
  };
}

/**
 * Ask the live NimbusPost API which couriers serve `destinationPincode`.
 * Returns an empty array when no courier covers the route.
 */
export async function checkServiceability(query: ServiceabilityQuery): Promise<ServiceabilityOption[]> {
  const origin = originPincode();
  if (!origin) {
    throw new NimbusPostApiError({
      statusCode: 503,
      message: "Logistics is not configured. Set NIMBUSPOST_ORIGIN_PINCODE in the environment.",
    });
  }

  const params = new URLSearchParams({
    origin,
    destination: query.destinationPincode,
    payment_type: query.paymentType.toLowerCase(),
    weight: String(query.weightGrams),
    cod_amount: String(query.paymentType === "COD" ? Math.max(0, query.codAmount ?? 0) : 0),
  });

  const payload = await request(`/courier/serviceability?${params.toString()}`, { method: "GET" });
  return extractCarriers(payload)
    .map(normalizeCarrier)
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
  courierId?: number | null;
  warehouseName?: string;
  warehouseAddress?: AddressPayload;
};

export type CreatedShipment = {
  shipmentId: string | null;
  awbNumber: string;
  courierName: string;
  courierId: number | null;
  freight: number | null;
  raw: unknown;
};

export async function createShipment(input: CreateShipmentInput): Promise<CreatedShipment> {
  const warehouse = input.warehouseAddress;
  const payload: Record<string, unknown> = {
    order_number: input.orderNumber,
    payment_type: input.paymentType === "COD" ? "cod" : "prepaid",
    order_amount: Number(input.orderAmount.toFixed(2)),
    package_weight: input.weightGrams,
    package_length: input.lengthCm ?? 15,
    package_breadth: input.breadthCm ?? 10,
    package_height: input.heightCm ?? 10,
    consignee: {
      name: input.consignee.name,
      address: input.consignee.address,
      address_2: input.consignee.address2 ?? "",
      city: input.consignee.city,
      state: input.consignee.state,
      pincode: input.consignee.pincode,
      phone: input.consignee.phone,
      ...(input.consignee.email ? { email: input.consignee.email } : {}),
    },
    ...(warehouse
      ? {
          pickup: {
            warehouse_name: input.warehouseName ?? "BCTLABS",
            name: warehouse.name,
            address: warehouse.address,
            address_2: warehouse.address2 ?? "",
            city: warehouse.city,
            state: warehouse.state,
            pincode: warehouse.pincode,
            phone: warehouse.phone,
          },
        }
      : {}),
  };

  if (process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID) {
    payload.pickup_warehouse_id = Number(process.env.NIMBUSPOST_PICKUP_WAREHOUSE_ID);
  }
  // Passing courier_id makes NimbusPost assign that courier (we pass the
  // cheapest one); without it the account's default auto-assignment applies.
  if (input.courierId) payload.courier_id = input.courierId;

  const response = await request("/shipments", { method: "POST", body: JSON.stringify(payload) });
  const data = asRecord(asRecord(response)?.data) ?? asRecord(response) ?? {};
  const awbNumber = firstString(data, ["awb_number", "awb", "awbNumber"]);

  if (!awbNumber) {
    throw new NimbusPostApiError({
      statusCode: 502,
      message: "NimbusPost did not return an AWB number for this shipment.",
      details: response,
    });
  }

  return {
    shipmentId: firstString(data, ["id", "shipment_id", "_id"]) || null,
    awbNumber,
    courierName: firstString(data, ["courier_name", "courier", "courierName"]),
    courierId: firstNumber(data, ["courier_id", "courierId"]),
    freight: firstNumber(data, ["freight_charges", "freight", "shipping_charges"]),
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
export async function generateManifest(awbNumbers: string[]): Promise<{ pdfUrl: string | null; raw: unknown }> {
  if (!awbNumbers.length) {
    throw new NimbusPostApiError({ statusCode: 400, message: "At least one AWB is required." });
  }

  const response = await request("/shipments/manifest", {
    method: "POST",
    body: JSON.stringify({ awbs: awbNumbers }),
  });

  const envelope = asRecord(response);
  const data = envelope?.data ?? response;
  const record = asRecord(data);
  const candidate =
    (typeof data === "string" && data) ||
    (record ? firstString(record, ["pdf_url", "url", "manifest_url", "file", "link"]) : "");
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

  // Delivered and RTO-delivered first: they contain "DELIVER" substrings that
  // would otherwise match the out-for-delivery branch.
  if (token.includes("RTO") && token.includes("DELIVER")) return "RTO_DELIVERED";
  if (token.includes("DELIVER")) return "DELIVERED";
  if (token.includes("RTO")) return "RTO_IN_TRANSIT";
  if (token === "OFD" || token.includes("OUT_FOR_DELIVERY") || token.includes("OUT_FOR_DELIVRY")) {
    return "OUT_FOR_DELIVERY";
  }
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
  if (
    token.includes("EXCEPTION") ||
    token.includes("UNDELIVER") ||
    token.includes("FAILED") ||
    token === "NDR" ||
    token.includes("NOT_DELIVERED") ||
    token.includes("HOLD") ||
    token.includes("ADDRESS")
  ) {
    return "EXCEPTION";
  }
  if (token.includes("CREATED") || token.includes("BOOKED") || token.includes("NEW")) return "CREATED";
  return "UNKNOWN";
}
