import { api } from "./api";
import type { Business } from "../types";

export async function getBusiness(): Promise<Business> {
  const { data } = await api.get<Business>("/settings/business");
  return data;
}

export async function updateBusiness(payload: {
  name: string;
  phone?: string | null;
  address?: string | null;
  currency: string;
  qrPaymentInfo?: string | null;
}): Promise<Business> {
  const { data } = await api.put<Business>("/settings/business", payload);
  return data;
}
