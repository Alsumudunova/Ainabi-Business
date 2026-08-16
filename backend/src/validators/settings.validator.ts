import { z } from "zod";

export const updateBusinessSchema = z.object({
  name: z.string().min(2, "Бизнес атын жазыңыз"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().min(1).default("KGS"),
});

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
