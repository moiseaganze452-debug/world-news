import type { Metadata } from "next";
import { getAllArticlesPaginated } from "@/services/public-content-service";
import { ArticleCard } from "@/components/articles/article-card";
import { Pagination } from "@/components/navigation/pagination";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Toute l'actualité en continu sur World News.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ActualitesPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const { items, total, totalPages } = await getAllArticlesPaginated({ page });

  return (
    <div className="container py-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Actualités</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} article{total > 1 ? "s" : ""} publié{total > 1 ? "s" : ""}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} size="medium" />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/actualites" />
    </div>
  );
}
