import type { Metadata } from "next";
import { searchArticles } from "@/services/public-content-service";
import { ArticleCard } from "@/components/articles/article-card";
import { Pagination } from "@/components/navigation/pagination";
import { SearchBox } from "@/components/navigation/search-box";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

export const metadata: Metadata = {
  title: "Recherche",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "", page: pageParam } = await searchParams;
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // §19/§51 — la recherche déclenche une requête ILIKE sur toute la table
  // d'articles : rate-limitée pour éviter un DoS applicatif par requêtes
  // répétées, avant même d'exécuter la recherche.
  const ip = await getClientIp();
  const rateLimitResult = await checkRateLimit("search", ip);
  if (!rateLimitResult.success) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">{rateLimitResult.message}</p>
      </div>
    );
  }

  const { items, total, totalPages } = await searchArticles(q, { page });

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Recherche</h1>
        <div className="mt-4 max-w-lg">
          <SearchBox defaultValue={q} />
        </div>
        {q && (
          <p className="mt-3 text-sm text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""} pour « {q} »
          </p>
        )}
      </header>

      {q && items.length === 0 && (
        <p className="text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
      )}

      {items.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} size="medium" />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/recherche?q=${encodeURIComponent(q)}`} />
    </div>
  );
}
