import { z } from "zod";

export const dashboardQuerySchema = z.object({
  range: z.enum(["today", "7d", "30d", "month"]).default("today"),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
