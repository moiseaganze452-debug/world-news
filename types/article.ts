import type { Article, Author, Category, Media, Tag } from "@prisma/client";

/** Article tel qu'affiché sur le site public, avec ses relations résolues. */
export type ArticleWithRelations = Article & {
  author: Author;
  category: Category;
  subCategory: Category | null;
  coverImage: Media | null;
  tags: Tag[];
};

/** Carte article utilisée dans les grilles (homepage, catégorie, recherche). */
export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  authorSlug: string;
  publishedAt: Date | null;
  readingTimeMin: number | null;
  isBreaking: boolean;
  isSponsored: boolean;
}
