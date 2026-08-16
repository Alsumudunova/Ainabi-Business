import { z } from "zod";

export const stockMovementTypeEnum = z.enum(["IN", "OUT", "ADJUSTMENT", "WRITE_OFF"]);

export const createStockMovementSchema = z.object({
  productId: z.string().min(1),
  type: stockMovementTypeEnum,
  quantity: z.coerce.number().positive("Саны 0дон чоң болушу керек"),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  supplierId: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
});

export const stockQuerySchema = z.object({
  type: stockMovementTypeEnum.or(z.literal("SALE")).optional(),
  productId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(30),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type StockQuery = z.infer<typeof stockQuerySchema>;
