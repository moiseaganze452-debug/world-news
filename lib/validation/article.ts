import { z } from "zod";

export const articleStatusEnum = z.enum([
  "BROUILLON",
  "EN_RELECTURE",
  "PROGRAMME",
  "PUBLIE",
  "ARCHIVE",
]);

export const articleSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(200),
  slug: z.string().min(3).max(220).optional(), // généré automatiquement si absent
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Le contenu ne peut pas être vide"),

  categoryId: z.string().uuid("Catégorie invalide"),
  subCategoryId: z.string().uuid().optional().nullable(),
  authorId: z.string().uuid("Auteur invalide"),

  coverImageId: z.string().uuid().optional().nullable(),
  videoUrl: z.string().url().optional().or(z.literal("")),

  location: z.string().max(120).optional(),
  source: z.string().max(200).optional(),

  status: articleStatusEnum.default("BROUILLON"),
  scheduledAt: z.string().datetime().optional().nullable(),

  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  isBreaking: z.boolean().default(false),

  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  ogImageId: z.string().uuid().optional().nullable(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),

  tagIds: z.array(z.string().uuid()).default([]),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export const articleFilterSchema = z.object({
  search: z.string().optional(),
  status: articleStatusEnum.optional(),
  categoryId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(20),
});

export type ArticleFilterInput = z.infer<typeof articleFilterSchema>;
