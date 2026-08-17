import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createStockMovementSchema, stockQuerySchema } from "../validators/stock.validator";
import * as stockService from "../services/stock.service";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = stockQuerySchema.parse(req.query);
  const result = await stockService.listMovements(req.auth!.businessId, query);
  res.json(result);
});

export const summaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const summary = await stockService.stockSummary(req.auth!.businessId);
  res.json(summary);
});

export const reorderSuggestionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const suggestions = await stockService.getReorderSuggestions(req.auth!.businessId);
  res.json(suggestions);
});

export const createHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createStockMovementSchema.parse(req.body);
  const movement = await stockService.createMovement(req.auth!.businessId, req.auth!.employeeId, input);
  res.status(201).json(movement);
});
