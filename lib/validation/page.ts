import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().min(2, "2 caractères minimum").max(150),
  slug: z.string().min(1).max(150).optional(),
  content: z.string().min(1, "Le contenu ne peut pas être vide"),
  status: z.enum(["BROUILLON", "PUBLIE"]),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
});

export type PageInput = z.infer<typeof pageSchema>;
