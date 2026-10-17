import "server-only";

import { AddressLimitError, MAX_SAVED_ADDRESSES, type AddressInput, type SavedAddress } from "./address-fields";
import { toNumber } from "./format";
import { prisma } from "./prisma";

type AddressRow = {
  id: bigint;
  label: string;
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  is_default: boolean;
};

function mapAddress(row: AddressRow): SavedAddress {
  return {
    id: toNumber(row.id),
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company,
    address1: row.address_1,
    address2: row.address_2,
    city: row.city,
    state: row.state,
    postcode: row.postcode,
    country: row.country,
    phone: row.phone,
    isDefault: row.is_default,
  };
}

export async function listAddresses(customerId: number): Promise<SavedAddress[]> {
  const rows = await prisma.bctlabs_customer_addresses.findMany({
    where: { customer_id: BigInt(customerId) },
    orderBy: [{ is_default: "desc" }, { updated_at: "desc" }],
  });
  return rows.map(mapAddress);
}

/** Grouped address counts for the admin customer list. */
export async function listAddressSummaries(
  customerIds: number[],
): Promise<Map<number, SavedAddress[]>> {
  if (!customerIds.length) return new Map();
  const rows = await prisma.bctlabs_customer_addresses.findMany({
    where: { customer_id: { in: customerIds.map((id) => BigInt(id)) } },
    orderBy: [{ is_default: "desc" }, { updated_at: "desc" }],
  });
  const grouped = new Map<number, SavedAddress[]>();
  for (const row of rows) {
    const key = toNumber(row.customer_id);
    const list = grouped.get(key) ?? [];
    list.push(mapAddress(row));
    grouped.set(key, list);
  }
  return grouped;
}

export async function createAddress(
  customerId: number,
  input: AddressInput,
): Promise<SavedAddress> {
  const customer = BigInt(customerId);
  // Checkout can offer "save this address" repeatedly; keep one copy.
  const duplicate = await prisma.bctlabs_customer_addresses.findFirst({
    where: {
      customer_id: customer,
      first_name: input.firstName,
      last_name: input.lastName,
      address_1: input.address1,
      postcode: input.postcode,
      phone: input.phone,
    },
  });
  if (duplicate) return mapAddress(duplicate);

  const count = await prisma.bctlabs_customer_addresses.count({
    where: { customer_id: customer },
  });
  if (count >= MAX_SAVED_ADDRESSES) throw new AddressLimitError();

  const makeDefault = input.isDefault || count === 0;
  const row = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.bctlabs_customer_addresses.updateMany({
        where: { customer_id: customer },
        data: { is_default: false },
      });
    }
    return tx.bctlabs_customer_addresses.create({
      data: {
        customer_id: customer,
        label: input.label,
        first_name: input.firstName,
        last_name: input.lastName,
        company: input.company ?? "",
        address_1: input.address1,
        address_2: input.address2 ?? "",
        city: input.city,
        state: input.state,
        postcode: input.postcode,
        country: input.country,
        phone: input.phone,
        is_default: makeDefault,
      },
    });
  });
  return mapAddress(row);
}

export async function updateAddress(
  customerId: number,
  id: number,
  input: AddressInput,
): Promise<SavedAddress | null> {
  const customer = BigInt(customerId);
  const existing = await prisma.bctlabs_customer_addresses.findFirst({
    where: { id: BigInt(id), customer_id: customer },
  });
  if (!existing) return null;

  const row = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.bctlabs_customer_addresses.updateMany({
        where: { customer_id: customer },
        data: { is_default: false },
      });
    }
    return tx.bctlabs_customer_addresses.update({
      where: { id: BigInt(id) },
      data: {
        label: input.label,
        first_name: input.firstName,
        last_name: input.lastName,
        company: input.company ?? "",
        address_1: input.address1,
        address_2: input.address2 ?? "",
        city: input.city,
        state: input.state,
        postcode: input.postcode,
        country: input.country,
        phone: input.phone,
        is_default: input.isDefault ? true : existing.is_default,
      },
    });
  });
  return mapAddress(row);
}

export async function setDefaultAddress(
  customerId: number,
  id: number,
): Promise<SavedAddress | null> {
  const customer = BigInt(customerId);
  const existing = await prisma.bctlabs_customer_addresses.findFirst({
    where: { id: BigInt(id), customer_id: customer },
  });
  if (!existing) return null;

  const row = await prisma.$transaction(async (tx) => {
    await tx.bctlabs_customer_addresses.updateMany({
      where: { customer_id: customer },
      data: { is_default: false },
    });
    return tx.bctlabs_customer_addresses.update({
      where: { id: BigInt(id) },
      data: { is_default: true },
    });
  });
  return mapAddress(row);
}

export async function deleteAddress(customerId: number, id: number): Promise<boolean> {
  const customer = BigInt(customerId);
  return prisma.$transaction(async (tx) => {
    const existing = await tx.bctlabs_customer_addresses.findFirst({
      where: { id: BigInt(id), customer_id: customer },
    });
    if (!existing) return false;

    await tx.bctlabs_customer_addresses.delete({ where: { id: BigInt(id) } });

    // Keep one default address so checkout always has something to preselect.
    if (existing.is_default) {
      const next = await tx.bctlabs_customer_addresses.findFirst({
        where: { customer_id: customer },
        orderBy: { updated_at: "desc" },
      });
      if (next) {
        await tx.bctlabs_customer_addresses.update({
          where: { id: next.id },
          data: { is_default: true },
        });
      }
    }
    return true;
  });
}
