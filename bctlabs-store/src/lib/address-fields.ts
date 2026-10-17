import { z } from "zod";

export const MAX_SAVED_ADDRESSES = 10;

export const addressInputSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60).default("Home"),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  company: z.string().trim().max(191).optional().default(""),
  address1: z.string().trim().min(1, "Address is required").max(191),
  address2: z.string().trim().max(191).optional().default(""),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  postcode: z.string().trim().min(1, "Postcode is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(2).default("IN"),
  phone: z.string().trim().min(1, "Phone is required").max(32),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export type SavedAddress = {
  id: number;
  label: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export class AddressLimitError extends Error {
  constructor() {
    super(`You can save up to ${MAX_SAVED_ADDRESSES} addresses.`);
    this.name = "AddressLimitError";
  }
}
