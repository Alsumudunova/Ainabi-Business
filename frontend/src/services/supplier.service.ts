import { api } from "./api";
import type { PaymentMethod, Supplier, SupplierDetail } from "../types";

export interface SupplierPayload {
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface SupplierSummary {
  totalOutstanding: number;
  openDebts: number;
}

export async function listSuppliers(search?: string): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>("/suppliers", { params: { search } });
  return data;
}

export async function getSupplierSummary(): Promise<SupplierSummary> {
  const { data } = await api.get<SupplierSummary>("/suppliers/summary");
  return data;
}

export async function getSupplier(id: string): Promise<SupplierDetail> {
  const { data } = await api.get<SupplierDetail>(`/suppliers/${id}`);
  return data;
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const { data } = await api.post<Supplier>("/suppliers", payload);
  return data;
}

export async function updateSupplier(id: string, payload: SupplierPayload): Promise<Supplier> {
  const { data } = await api.put<Supplier>(`/suppliers/${id}`, payload);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

export async function createSupplierDebt(supplierId: string, payload: { totalAmount: number; comment?: string | null }): Promise<void> {
  await api.post(`/suppliers/${supplierId}/debts`, payload);
}

export async function addSupplierPayment(
  debtId: string,
  payload: { amount: number; method: Exclude<PaymentMethod, "DEBT">; comment?: string | null },
): Promise<void> {
  await api.post(`/suppliers/debts/${debtId}/payments`, payload);
}
