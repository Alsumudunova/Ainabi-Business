import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/prisma";
import { updateBusinessSchema } from "../validators/settings.validator";

export const getBusinessHandler = asyncHandler(async (req: Request, res: Response) => {
  const business = await prisma.business.findUnique({ where: { id: req.auth!.businessId } });
  res.json(business);
});

export const updateBusinessHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBusinessSchema.parse(req.body);
  const business = await prisma.business.update({ where: { id: req.auth!.businessId }, data: input });
  res.json(business);
});
