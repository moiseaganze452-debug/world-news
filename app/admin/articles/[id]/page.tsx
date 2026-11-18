import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/security/permissions";
import { prisma } from "@/lib/db/prisma";
import { getArticleById } from "@/services/article-service";
import { updateArticleAction } from "@/lib/actions/article-actions";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Modifier l'article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  const article = await getArticleById(id);
  if (!article) notFound();

  const isOwner = article.createdById === session.user.id;
  const canEdit = can(session.user.role, "articles.edit.all") || (can(session.user.role, "articles.edit.own") && isOwner);
  if (!canEdit) redirect("/admin/articles");

  const [categories, authors, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.author.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier l'article</h1>
        <p className="mt-1 text-sm text-muted-foreground">{article.title}</p>
      </div>

      <ArticleForm
        action={boundAction}
        categories={categories.map((c) => ({ id: c.id, label: c.name }))}
        authors={authors.map((a) => ({ id: a.id, label: a.displayName }))}
        tags={tags.map((t) => ({ id: t.id, label: t.name }))}
        initialValues={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? undefined,
          content: article.content,
          categoryId: article.categoryId,
          subCategoryId: article.subCategoryId ?? undefined,
          authorId: article.authorId,
          status: article.status,
          isFeatured: article.isFeatured,
          isTrending: article.isTrending,
          isSponsored: article.isSponsored,
          isBreaking: article.isBreaking,
          seoTitle: article.seoTitle ?? undefined,
          seoDescription: article.seoDescription ?? undefined,
          tagIds: article.tags.map((t) => t.id),
        }}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
