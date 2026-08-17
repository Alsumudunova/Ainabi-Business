import { api } from "./api";
import type { Paginated, ProductUnit, StockMovement, StockMovementType } from "../types";

export interface ReorderSuggestion {
  productId: string;
  name: string;
  quantity: number;
  unit: ProductUnit;
  dailyVelocity: number;
  daysUntilStockout: number | null;
}

export interface StockSummary {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface CreateMovementPayload {
  productId: string;
  type: Exclude<StockMovementType, "SALE">;
  quantity: number;
  purchasePrice?: number;
  supplierId?: string | null;
  comment?: string | null;
}

export async function getStockSummary(): Promise<StockSummary> {
  const { data } = await api.get<StockSummary>("/stock/summary");
  return data;
}

export async function listMovements(params: {
  type?: StockMovementType;
  productId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<StockMovement>> {
  const { data } = await api.get<Paginated<StockMovement>>("/stock", { params });
  return data;
}

export async function getReorderSuggestions(): Promise<ReorderSuggestion[]> {
  const { data } = await api.get<ReorderSuggestion[]>("/stock/reorder-suggestions");
  return data;
}

export async function createMovement(payload: CreateMovementPayload): Promise<StockMovement> {
  const { data } = await api.post<StockMovement>("/stock", payload);
  return data;
}
