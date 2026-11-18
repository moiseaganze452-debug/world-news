import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/security/permissions";
import { prisma } from "@/lib/db/prisma";
import { createArticleAction } from "@/lib/actions/article-actions";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Nouvel article" };

export default async function NewArticlePage() {
  const session = await auth();
  if (!session || !can(session.user.role, "articles.create")) {
    redirect("/admin/articles");
  }

  const [categories, authors, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.author.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvel article</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rédigez et publiez un nouvel article.</p>
      </div>

      <ArticleForm
        action={createArticleAction}
        categories={categories.map((c) => ({ id: c.id, label: c.name }))}
        authors={authors.map((a) => ({ id: a.id, label: a.displayName }))}
        tags={tags.map((t) => ({ id: t.id, label: t.name }))}
        submitLabel="Créer l'article"
      />
    </div>
  );
}
