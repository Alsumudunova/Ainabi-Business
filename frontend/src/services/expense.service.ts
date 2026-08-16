import { api } from "./api";
import type { Expense, ExpenseCategory } from "../types";

export async function listExpenses(params: { from?: string; to?: string; category?: ExpenseCategory }): Promise<Expense[]> {
  const { data } = await api.get<Expense[]>("/expenses", { params });
  return data;
}

export async function createExpense(payload: { category: ExpenseCategory; amount: number; comment?: string | null }): Promise<Expense> {
  const { data } = await api.post<Expense>("/expenses", payload);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
