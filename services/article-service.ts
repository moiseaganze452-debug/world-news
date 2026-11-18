import { prisma } from "@/lib/db/prisma";
import { toUniqueSlug } from "@/lib/utils/slug";
import { estimateReadingTime } from "@/lib/utils/reading-time";
import type { ArticleInput, ArticleFilterInput } from "@/lib/validation/article";
import type { ArticleStatus, Prisma } from "@prisma/client";

/** Extrait le texte brut d'un contenu JSON riche (Tiptap) pour calculer le temps de lecture. */
function extractPlainText(jsonContent: string): string {
  try {
    const doc = JSON.parse(jsonContent);
    const parts: string[] = [];
    function walk(node: any) {
      if (node?.text) parts.push(node.text);
      if (Array.isArray(node?.content)) node.content.forEach(walk);
    }
    walk(doc);
    return parts.join(" ");
  } catch {
    return jsonContent;
  }
}

export async function listArticles(filters: ArticleFilterInput) {
  const where: Prisma.ArticleWhereInput = {};

  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }
  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.authorId) where.authorId = filters.authorId;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { displayName: true, slug: true } },
        coverImage: { select: { url: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: { tags: true, category: true, subCategory: true, coverImage: true },
  });
}

export async function createArticle(
  input: ArticleInput,
  createdById: string
): Promise<{ id: string }> {
  const slug =
    input.slug ??
    (await toUniqueSlug(input.title, async (candidate) => {
      const existing = await prisma.article.findUnique({ where: { slug: candidate } });
      return !!existing;
    }));

  const readingTimeMin = estimateReadingTime(extractPlainText(input.content));
  const publishedAt = input.status === "PUBLIE" ? new Date() : null;

  const article = await prisma.article.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId ?? undefined,
      authorId: input.authorId,
      createdById,
      coverImageId: input.coverImageId ?? undefined,
      videoUrl: input.videoUrl || undefined,
      location: input.location,
      source: input.source,
      status: input.status,
      publishedAt,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      isFeatured: input.isFeatured,
      isTrending: input.isTrending,
      isSponsored: input.isSponsored,
      isBreaking: input.isBreaking,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImageId: input.ogImageId ?? undefined,
      canonicalUrl: input.canonicalUrl || undefined,
      readingTimeMin,
      tags: { connect: input.tagIds.map((id) => ({ id })) },
    },
    select: { id: true },
  });

  return article;
}

export async function updateArticle(id: string, input: ArticleInput, editedById: string): Promise<void> {
  const current = await prisma.article.findUnique({ where: { id }, select: { content: true, status: true, publishedAt: true } });
  if (!current) throw new Error("Article introuvable.");

  // Historique des modifications (§9 : historique des versions)
  await prisma.articleRevision.create({
    data: { articleId: id, content: current.content, editedById },
  });

  const readingTimeMin = estimateReadingTime(extractPlainText(input.content));
  const isNewlyPublished = input.status === "PUBLIE" && current.status !== "PUBLIE";

  await prisma.article.update({
    where: { id },
    data: {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId ?? undefined,
      authorId: input.authorId,
      coverImageId: input.coverImageId ?? undefined,
      videoUrl: input.videoUrl || undefined,
      location: input.location,
      source: input.source,
      status: input.status,
      publishedAt: isNewlyPublished ? new Date() : current.publishedAt,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      isFeatured: input.isFeatured,
      isTrending: input.isTrending,
      isSponsored: input.isSponsored,
      isBreaking: input.isBreaking,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImageId: input.ogImageId ?? undefined,
      canonicalUrl: input.canonicalUrl || undefined,
      readingTimeMin,
      tags: { set: input.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({ where: { id } });
}

export async function duplicateArticle(id: string, createdById: string): Promise<{ id: string }> {
  const original = await prisma.article.findUnique({ where: { id }, include: { tags: true } });
  if (!original) throw new Error("Article introuvable.");

  const slug = await toUniqueSlug(`${original.title} copie`, async (candidate) => {
    const existing = await prisma.article.findUnique({ where: { slug: candidate } });
    return !!existing;
  });

  const copy = await prisma.article.create({
    data: {
      title: `${original.title} (copie)`,
      slug,
      excerpt: original.excerpt,
      content: original.content,
      categoryId: original.categoryId,
      subCategoryId: original.subCategoryId,
      authorId: original.authorId,
      createdById,
      status: "BROUILLON",
      tags: { connect: original.tags.map((t) => ({ id: t.id })) },
    },
    select: { id: true },
  });

  return copy;
}

/** Actions groupées (§15) */
export async function bulkUpdateStatus(ids: string[], status: ArticleStatus): Promise<void> {
  await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: { status, publishedAt: status === "PUBLIE" ? new Date() : undefined },
  });
}

export async function bulkUpdateCategory(ids: string[], categoryId: string): Promise<void> {
  await prisma.article.updateMany({ where: { id: { in: ids } }, data: { categoryId } });
}

export async function bulkDelete(ids: string[]): Promise<void> {
  await prisma.article.deleteMany({ where: { id: { in: ids } } });
}
