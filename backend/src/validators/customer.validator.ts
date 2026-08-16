import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Кардардын атын жазыңыз"),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
