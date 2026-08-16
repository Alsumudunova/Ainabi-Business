import { api } from "./api";
import type { Debt, PaymentMethod } from "../types";

export interface DebtSummary {
  totalOutstanding: number;
  openDebts: number;
}

export async function listDebts(status?: "OPEN" | "ALL"): Promise<Debt[]> {
  const { data } = await api.get<Debt[]>("/debts", { params: { status } });
  return data;
}

export async function getDebtSummary(): Promise<DebtSummary> {
  const { data } = await api.get<DebtSummary>("/debts/summary");
  return data;
}

export async function createDebt(payload: { customerId: string; totalAmount: number; comment?: string | null }): Promise<Debt> {
  const { data } = await api.post<Debt>("/debts", payload);
  return data;
}

export async function addDebtPayment(
  debtId: string,
  payload: { amount: number; method: Exclude<PaymentMethod, "DEBT">; comment?: string | null },
): Promise<void> {
  await api.post(`/debts/${debtId}/payments`, payload);
}
