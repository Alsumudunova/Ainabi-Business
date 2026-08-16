import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { categorySchema } from "../validators/category.validator";
import * as categoryService from "../services/category.service";

export const listHandler = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.listCategories(req.auth!.businessId);
  res.json(categories);
});

export const createHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = categorySchema.parse(req.body);
  const category = await categoryService.createCategory(req.auth!.businessId, input);
  res.status(201).json(category);
});

export const updateHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = categorySchema.parse(req.body);
  const category = await categoryService.updateCategory(req.auth!.businessId, req.params.id, input);
  res.json(category);
});

export const deleteHandler = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.auth!.businessId, req.params.id);
  res.status(204).send();
});
