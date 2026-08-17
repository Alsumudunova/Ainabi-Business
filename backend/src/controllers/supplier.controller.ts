import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createSupplierDebtSchema, supplierPaymentSchema, supplierSchema } from "../validators/supplier.validator";
import * as supplierService from "../services/supplier.service";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const suppliers = await supplierService.listSuppliers(req.auth!.businessId, req.query.search as string | undefined);
  res.json(suppliers);
});

export const summaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const summary = await supplierService.supplierDebtSummary(req.auth!.businessId);
  res.json(summary);
});

export const getHandler = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.getSupplier(req.auth!.businessId, req.params.id);
  res.json(supplier);
});

export const createHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = supplierSchema.parse(req.body);
  const supplier = await supplierService.createSupplier(req.auth!.businessId, input);
  res.status(201).json(supplier);
});

export const updateHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = supplierSchema.parse(req.body);
  const supplier = await supplierService.updateSupplier(req.auth!.businessId, req.params.id, input);
  res.json(supplier);
});

export const deleteHandler = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.deleteSupplier(req.auth!.businessId, req.params.id);
  res.status(204).send();
});

export const createDebtHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = createSupplierDebtSchema.parse(req.body);
  const debt = await supplierService.createSupplierDebt(req.auth!.businessId, req.params.id, input);
  res.status(201).json(debt);
});

export const addPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = supplierPaymentSchema.parse(req.body);
  const payment = await supplierService.addSupplierPayment(req.auth!.businessId, req.params.debtId, input);
  res.status(201).json(payment);
});
