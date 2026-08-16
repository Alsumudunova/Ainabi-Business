import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { productQuerySchema, productSchema } from "../validators/product.validator";
import * as productService from "../services/product.service";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = productQuerySchema.parse(req.query);
  const result = await productService.listProducts(req.auth!.businessId, query);
  res.json(result);
});

export const getHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProduct(req.auth!.businessId, req.params.id);
  res.json(product);
});

export const getByBarcodeHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.findByBarcode(req.auth!.businessId, req.params.barcode);
  res.json(product);
});

export const createHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = productSchema.parse(req.body);
  const product = await productService.createProduct(req.auth!.businessId, input);
  res.status(201).json(product);
});

export const updateHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = productSchema.parse(req.body);
  const product = await productService.updateProduct(req.auth!.businessId, req.params.id, input);
  res.json(product);
});

export const deleteHandler = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.auth!.businessId, req.params.id);
  res.status(204).send();
});
