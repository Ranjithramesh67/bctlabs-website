"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

const MAX_NAME = 255;

function parseId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readName(formData: FormData): string {
  return String(formData.get("name") ?? "").trim();
}

/* -------------------------------------------------------------------------- */
/* Country                                                                    */
/* -------------------------------------------------------------------------- */

export async function storeCountry(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = readName(formData);
  const duplicate = name
    ? await prisma.countries.findFirst({ where: { name } })
    : null;

  // CreateCountryRequest: `name => required|unique:countries,name`.
  if (!name || name.length > MAX_NAME || duplicate) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/countries");
  }

  await prisma.countries.create({ data: { name } });

  await setFlash("success", t("country.country_saved_successfully"));
  revalidatePath("/admin/countries");
  redirect("/admin/countries");
}

export async function updateCountry(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const name = readName(formData);
  const duplicate =
    id !== null && name
      ? await prisma.countries.findFirst({
          where: { name, id: { not: id } },
        })
      : null;

  // UpdateCountryRequest: `name => required|unique:countries,name,<id>`.
  if (id === null || !name || name.length > MAX_NAME || duplicate) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect("/admin/countries");
  }

  await prisma.countries.update({ where: { id }, data: { name } });

  await setFlash("success", t("country.country_updated_successfully"));
  revalidatePath("/admin/countries");
  redirect("/admin/countries");
}

export async function deleteCountry(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  if (id !== null) {
    await prisma.countries.delete({ where: { id } }).catch(() => null);
    await setFlash("success", "Country deleted successfully.");
  }

  revalidatePath("/admin/countries");
  redirect("/admin/countries");
}

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

export async function storeState(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = readName(formData);
  const countryId = parseId(formData.get("country_id"));
  const backTo = countryId ? `/admin/states/${countryId}` : "/admin/countries";

  if (!name || name.length > MAX_NAME || countryId === null) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  const country = await prisma.countries.findUnique({
    where: { id: countryId },
  });
  if (!country) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  await prisma.states.create({ data: { name, country_id: countryId } });

  await setFlash("success", "State Created Successfully.");
  revalidatePath(`/admin/states/${countryId}`);
  redirect(backTo);
}

export async function updateState(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const name = readName(formData);
  const countryId = parseId(formData.get("country_id"));
  const backTo = countryId ? `/admin/states/${countryId}` : "/admin/countries";

  if (id === null || !name || name.length > MAX_NAME || countryId === null) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  const country = await prisma.countries.findUnique({
    where: { id: countryId },
  });
  if (!country) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  await prisma.states.update({
    where: { id },
    data: { name, country_id: countryId },
  });

  await setFlash("success", "State Updated Successfully.");
  revalidatePath(`/admin/states/${countryId}`);
  redirect(backTo);
}

export async function deleteState(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const countryId = parseId(formData.get("country_id"));
  if (id !== null) {
    await prisma.states.delete({ where: { id } }).catch(() => null);
    await setFlash("success", "State Deleted Successfully.");
  }

  const backTo = countryId ? `/admin/states/${countryId}` : "/admin/countries";
  revalidatePath(backTo);
  redirect(backTo);
}

/* -------------------------------------------------------------------------- */
/* City                                                                       */
/* -------------------------------------------------------------------------- */

export async function storeCity(formData: FormData): Promise<void> {
  await getCurrentUser();

  const name = readName(formData);
  const stateId = parseId(formData.get("state_id"));
  const backTo = stateId ? `/admin/cities/${stateId}` : "/admin/countries";

  if (!name || name.length > MAX_NAME || stateId === null) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  const state = await prisma.states.findUnique({ where: { id: stateId } });
  if (!state) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  await prisma.cities.create({ data: { name, state_id: stateId } });

  await setFlash("success", "City Created Successfully.");
  revalidatePath(`/admin/cities/${stateId}`);
  redirect(backTo);
}

export async function updateCity(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const name = readName(formData);
  const stateId = parseId(formData.get("state_id"));
  const backTo = stateId ? `/admin/cities/${stateId}` : "/admin/countries";

  if (id === null || !name || name.length > MAX_NAME || stateId === null) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  const state = await prisma.states.findUnique({ where: { id: stateId } });
  if (!state) {
    await setFlash("error", t("common.something_went_wrong"));
    redirect(backTo);
  }

  await prisma.cities.update({
    where: { id },
    data: { name, state_id: stateId },
  });

  await setFlash("success", "City Updated Successfully.");
  revalidatePath(`/admin/cities/${stateId}`);
  redirect(backTo);
}

export async function deleteCity(formData: FormData): Promise<void> {
  await getCurrentUser();

  const id = parseId(formData.get("id"));
  const stateId = parseId(formData.get("state_id"));
  if (id !== null) {
    await prisma.cities.delete({ where: { id } }).catch(() => null);
    await setFlash("success", "City Deleted Successfully.");
  }

  const backTo = stateId ? `/admin/cities/${stateId}` : "/admin/countries";
  revalidatePath(backTo);
  redirect(backTo);
}
