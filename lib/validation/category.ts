import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(80),
  slug: z.string().min(2).max(90).optional(),
  description: z.string().max(300).optional(),
  color: z.string().max(20).optional(),
  parentId: z.string().uuid().optional().nullable(),
  order: z.coerce.number().int().default(0),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
