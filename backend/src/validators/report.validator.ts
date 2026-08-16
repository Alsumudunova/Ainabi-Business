import { z } from "zod";

export const reportQuerySchema = z.object({
  preset: z.enum(["today", "yesterday", "7d", "30d", "month", "prevMonth", "custom"]).default("7d"),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
