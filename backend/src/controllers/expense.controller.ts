import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { expenseQuerySchema, expenseSchema } from "../validators/expense.validator";
import * as expenseService from "../services/expense.service";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = expenseQuerySchema.parse(req.query);
  const expenses = await expenseService.listExpenses(req.auth!.businessId, query);
  res.json(expenses);
});

export const createHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = expenseSchema.parse(req.body);
  const expense = await expenseService.createExpense(req.auth!.businessId, req.auth!.employeeId, input);
  res.status(201).json(expense);
});

export const deleteHandler = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.auth!.businessId, req.params.id);
  res.status(204).send();
});
