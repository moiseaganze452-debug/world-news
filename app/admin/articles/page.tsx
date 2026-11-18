import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { can } from "@/lib/security/permissions";
import { listArticles } from "@/services/article-service";
import { articleFilterSchema } from "@/lib/validation/article";
import { ArticleStatusBadge } from "@/components/admin/article-status-badge";
import { ArticleRowActions } from "@/components/admin/article-row-actions";

export const metadata = { title: "Articles" };

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;
  const filters = articleFilterSchema.parse(params);

  const { items, total, page, pageSize } = await listArticles(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canCreate = can(session?.user.role, "articles.create");
  const canDelete = can(session?.user.role, "articles.delete");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} article{total > 1 ? "s" : ""} au total</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/articles/nouveau"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nouvel article
          </Link>
        )}
      </div>

      <form className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4">
        <input
          type="search"
          name="search"
          defaultValue={filters.search}
          placeholder="Rechercher un titre..."
          className="min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="EN_RELECTURE">En relecture</option>
          <option value="PROGRAMME">Programmé</option>
          <option value="PUBLIE">Publié</option>
          <option value="ARCHIVE">Archivé</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
          Filtrer
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Vues</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun article ne correspond à ces critères.
                </td>
              </tr>
            )}
            {items.map((article) => (
              <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">{article.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{article.category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{article.author.displayName}</td>
                <td className="px-4 py-3">
                  <ArticleStatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{article.viewCount.toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <ArticleRowActions articleId={article.id} canDelete={canDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/articles?page=${p}`}
              className={`rounded-md px-3 py-1.5 ${
                p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
