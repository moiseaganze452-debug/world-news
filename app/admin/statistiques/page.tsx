import {
  getTopArticlesByViews,
  getPopularCategories,
  getGlobalStats,
} from "@/services/analytics-service";
import { StatCard } from "@/components/admin/stat-card";
import { PopularCategoriesChart } from "@/components/admin/popular-categories-chart";

export const metadata = { title: "Statistiques" };

export default async function StatisticsPage() {
  const [stats, topArticles, popularCategories] = await Promise.all([
    getGlobalStats(),
    getTopArticlesByViews(10),
    getPopularCategories(8),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vue d'ensemble de la performance du site.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vues totales" value={stats.totalViews.toLocaleString("fr-FR")} />
        <StatCard label="Articles publiés" value={stats.totalArticles.toString()} />
        <StatCard label="Commentaires approuvés" value={stats.totalComments.toString()} />
        <StatCard label="Abonnés newsletter" value={stats.totalSubscribers.toString()} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Impressions publicitaires" value={stats.totalAdImpressions.toLocaleString("fr-FR")} />
        <StatCard label="Clics publicitaires" value={stats.totalAdClicks.toLocaleString("fr-FR")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-base font-bold text-foreground">Catégories populaires</h2>
          <PopularCategoriesChart data={popularCategories.map((c) => ({ name: c.name, vues: c.totalViews }))} />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-base font-bold text-foreground">Articles les plus lus</h2>
          <ol className="space-y-3">
            {topArticles.map((article, index) => (
              <li key={article.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 shrink-0 text-muted-foreground">{index + 1}.</span>
                <div className="flex-1 truncate">
                  <p className="truncate font-medium text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">{article.category.name}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {article.viewCount.toLocaleString("fr-FR")} vues
                </span>
              </li>
            ))}
            {topArticles.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
