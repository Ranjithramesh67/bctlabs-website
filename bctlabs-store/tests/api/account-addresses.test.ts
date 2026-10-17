import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const listAddresses = vi.fn();
const createAddress = vi.fn();
const updateAddress = vi.fn();
const setDefaultAddress = vi.fn();
const deleteAddress = vi.fn();

vi.mock("@/lib/session", () => ({ getSession: (...args: unknown[]) => getSession(...args) }));
vi.mock("@/lib/addresses", () => ({
  listAddresses: (...args: unknown[]) => listAddresses(...args),
  createAddress: (...args: unknown[]) => createAddress(...args),
  updateAddress: (...args: unknown[]) => updateAddress(...args),
  setDefaultAddress: (...args: unknown[]) => setDefaultAddress(...args),
  deleteAddress: (...args: unknown[]) => deleteAddress(...args),
}));

import { GET, POST } from "@/app/api/account/addresses/route";
import { DELETE, PATCH } from "@/app/api/account/addresses/[id]/route";
import { AddressLimitError, type SavedAddress } from "@/lib/address-fields";

const address: SavedAddress = {
  id: 7,
  label: "Home",
  firstName: "Asha",
  lastName: "Rao",
  company: "",
  address1: "12 MG Road",
  address2: "",
  city: "Bengaluru",
  state: "Karnataka",
  postcode: "560001",
  country: "IN",
  phone: "9876543210",
  isDefault: true,
};

const validBody = {
  label: "Home",
  firstName: "Asha",
  lastName: "Rao",
  address1: "12 MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  postcode: "560001",
  country: "IN",
  phone: "9876543210",
};

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ id: "7" }) };

describe("saved address API", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ customerId: 31 });
  });

  it("requires a signed-in customer", async () => {
    getSession.mockResolvedValue({});
    const response = await GET();
    expect(response.status).toBe(401);
    expect(listAddresses).not.toHaveBeenCalled();
  });

  it("lists the signed-in customer's addresses", async () => {
    listAddresses.mockResolvedValue([address]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(listAddresses).toHaveBeenCalledWith(31);
    await expect(response.json()).resolves.toEqual({ addresses: [address] });
  });

  it("validates new addresses and reports field errors", async () => {
    const response = await POST(jsonRequest("http://localhost/api/account/addresses", "POST", { label: "Home" }));
    expect(response.status).toBe(422);
    const body = (await response.json()) as { fields?: Record<string, string> };
    expect(body.fields?.firstName).toBeTruthy();
    expect(createAddress).not.toHaveBeenCalled();
  });

  it("creates an address for the signed-in customer", async () => {
    createAddress.mockResolvedValue(address);
    const response = await POST(jsonRequest("http://localhost/api/account/addresses", "POST", validBody));
    expect(response.status).toBe(201);
    expect(createAddress).toHaveBeenCalledWith(31, expect.objectContaining({ city: "Bengaluru" }));
  });

  it("surfaces the saved-address limit", async () => {
    createAddress.mockRejectedValue(new AddressLimitError());
    const response = await POST(jsonRequest("http://localhost/api/account/addresses", "POST", validBody));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("up to") });
  });

  it("promotes an address to default with a partial patch", async () => {
    setDefaultAddress.mockResolvedValue(address);
    const response = await PATCH(
      jsonRequest("http://localhost/api/account/addresses/7", "PATCH", { isDefault: true }),
      context,
    );
    expect(response.status).toBe(200);
    expect(setDefaultAddress).toHaveBeenCalledWith(31, 7);
    expect(updateAddress).not.toHaveBeenCalled();
  });

  it("returns 404 when removing an address that is not the customer's", async () => {
    deleteAddress.mockResolvedValue(false);
    const response = await DELETE(jsonRequest("http://localhost/api/account/addresses/7", "DELETE"), context);
    expect(response.status).toBe(404);
  });
});
