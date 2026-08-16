import { z } from "zod";

export const expenseCategoryEnum = z.enum([
  "RENT",
  "SALARY",
  "PURCHASE",
  "TRANSPORT",
  "UTILITIES",
  "ADVERTISING",
  "OTHER",
]);

export const expenseSchema = z.object({
  category: expenseCategoryEnum,
  amount: z.coerce.number().positive("Сумма 0дон чоң болушу керек"),
  comment: z.string().optional().nullable(),
});

export const expenseQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category: expenseCategoryEnum.optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
