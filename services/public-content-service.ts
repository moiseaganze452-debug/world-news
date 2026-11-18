import { prisma } from "@/lib/db/prisma";
import type { ArticleCardData } from "@/types/article";
import { clampPagination } from "@/lib/utils/pagination";

function toCardData(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: { url: string } | null;
  category: { name: string; slug: string };
  author: { displayName: string; slug: string };
  publishedAt: Date | null;
  readingTimeMin: number | null;
  isBreaking: boolean;
  isSponsored: boolean;
}): ArticleCardData {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImage?.url ?? null,
    categoryName: article.category.name,
    categorySlug: article.category.slug,
    authorName: article.author.displayName,
    authorSlug: article.author.slug,
    publishedAt: article.publishedAt,
    readingTimeMin: article.readingTimeMin,
    isBreaking: article.isBreaking,
    isSponsored: article.isSponsored,
  };
}

const CARD_INCLUDE = {
  coverImage: { select: { url: true } },
  category: { select: { name: true, slug: true } },
  author: { select: { displayName: true, slug: true } },
} as const;

export async function getBreakingNews() {
  return prisma.article.findFirst({
    where: { status: "PUBLIE", isBreaking: true },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true },
  });
}

export async function getHeroArticle(): Promise<ArticleCardData | null> {
  const article = await prisma.article.findFirst({
    where: { status: "PUBLIE", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    include: CARD_INCLUDE,
  });
  return article ? toCardData(article) : null;
}

export async function getSecondaryArticles(excludeId?: string, take = 4): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLIE", id: excludeId ? { not: excludeId } : undefined },
    orderBy: { publishedAt: "desc" },
    take,
    include: CARD_INCLUDE,
  });
  return articles.map(toCardData);
}

export async function getLatestArticles(take = 8): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLIE" },
    orderBy: { publishedAt: "desc" },
    take,
    include: CARD_INCLUDE,
  });
  return articles.map(toCardData);
}

export async function getTrendingArticles(take = 5): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLIE", isTrending: true },
    orderBy: { viewCount: "desc" },
    take,
    include: CARD_INCLUDE,
  });
  return articles.map(toCardData);
}

export async function getCategoriesWithCount(take = 8) {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      _count: { select: { articles: { where: { status: "PUBLIE" } } } },
    },
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLIE" },
    include: {
      author: true,
      category: true,
      subCategory: true,
      coverImage: true,
      tags: true,
    },
  });
  return article;
}

export async function getSimilarArticles(article: {
  id: string;
  categoryId: string;
  tags: { id: string }[];
}, take = 4): Promise<ArticleCardData[]> {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLIE",
      id: { not: article.id },
      OR: [
        { categoryId: article.categoryId },
        { tags: { some: { id: { in: article.tags.map((t) => t.id) } } } },
      ],
    },
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take,
    include: CARD_INCLUDE,
  });
  return articles.map(toCardData);
}

export async function incrementArticleView(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getMainMenu() {
  const menu = await prisma.menu.findUnique({
    where: { slug: "menu-principal" },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: { children: { orderBy: { order: "asc" } } },
      },
    },
  });
  const items = menu?.items ?? [];

  // Résout targetId (UUID interne) vers le slug public utilisable dans l'URL,
  // pour les items de type CATEGORIE ou PAGE.
  const categoryIds = items.filter((i) => i.type === "CATEGORIE" && i.targetId).map((i) => i.targetId!);
  const pageIds = items.filter((i) => i.type === "PAGE" && i.targetId).map((i) => i.targetId!);

  const [categories, pages] = await Promise.all([
    categoryIds.length
      ? prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, slug: true } })
      : Promise.resolve([]),
    pageIds.length
      ? prisma.page.findMany({ where: { id: { in: pageIds } }, select: { id: true, slug: true } })
      : Promise.resolve([]),
  ]);

  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
  const pageSlugById = new Map(pages.map((p) => [p.id, p.slug]));

  return items.map((item) => ({
    id: item.id,
    label: item.label,
    type: item.type,
    url: item.url,
    resolvedSlug:
      item.type === "CATEGORIE" && item.targetId
        ? categorySlugById.get(item.targetId) ?? null
        : item.type === "PAGE" && item.targetId
          ? pageSlugById.get(item.targetId) ?? null
          : null,
  }));
}

export async function getEnabledSocialLinks() {
  return prisma.socialLink.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getArticlesByCategory(
  categoryId: string,
  params: { page?: number; pageSize?: number }
) {
  const { page, pageSize } = clampPagination(params);

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLIE", OR: [{ categoryId }, { subCategoryId: categoryId }] },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
    prisma.article.count({
      where: { status: "PUBLIE", OR: [{ categoryId }, { subCategoryId: categoryId }] },
    }),
  ]);

  return { items: items.map(toCardData), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({ where: { slug } });
}

export async function getArticlesByAuthor(authorId: string, params: { page?: number; pageSize?: number }) {
  const { page, pageSize } = clampPagination(params);

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLIE", authorId },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
    prisma.article.count({ where: { status: "PUBLIE", authorId } }),
  ]);

  return { items: items.map(toCardData), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function searchArticles(query: string, params: { page?: number; pageSize?: number }) {
  // §50 — clamp défensif de page/pageSize.
  // §51 — longueur maximale de la requête de recherche : évite les
  // requêtes ILIKE coûteuses sur des chaînes arbitrairement longues.
  const { page, pageSize } = clampPagination(params);
  const safeQuery = query.trim().slice(0, 100);

  if (!safeQuery) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const where = {
    status: "PUBLIE" as const,
    OR: [
      { title: { contains: safeQuery, mode: "insensitive" as const } },
      { excerpt: { contains: safeQuery, mode: "insensitive" as const } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
    prisma.article.count({ where }),
  ]);

  return { items: items.map(toCardData), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAllArticlesPaginated(params: { page?: number; pageSize?: number }) {
  const { page, pageSize } = clampPagination(params);

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLIE" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
    prisma.article.count({ where: { status: "PUBLIE" } }),
  ]);

  return { items: items.map(toCardData), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getVideoArticles(params: { page?: number; pageSize?: number }) {
  const { page, pageSize } = clampPagination(params);

  const where = { status: "PUBLIE" as const, videoUrl: { not: null } };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: CARD_INCLUDE,
    }),
    prisma.article.count({ where }),
  ]);

  return { items: items.map(toCardData), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
