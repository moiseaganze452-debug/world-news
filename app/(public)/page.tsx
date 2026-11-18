import Link from "next/link";
import { TrendingUp } from "lucide-react";
import {
  getHeroArticle,
  getSecondaryArticles,
  getLatestArticles,
  getTrendingArticles,
  getCategoriesWithCount,
} from "@/services/public-content-service";
import { ArticleCard } from "@/components/articles/article-card";
import { NewsletterSection } from "@/components/articles/newsletter-section";
import { AdSlot } from "@/components/advertising/ad-slot";

export default async function HomePage() {
  const hero = await getHeroArticle();
  const [secondary, latest, trending, categories] = await Promise.all([
    getSecondaryArticles(hero?.id, 4),
    getLatestArticles(8),
    getTrendingArticles(5),
    getCategoriesWithCount(8),
  ]);

  return (
    <div className="container space-y-14 py-8">
      {/* 6.2 Hero + 6.3 Actualités secondaires */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {hero ? (
          <ArticleCard article={hero} size="large" />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-muted text-muted-foreground">
            Aucun article à la une pour le moment.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {secondary.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} size="small" />
          ))}
        </div>
      </section>

      {/* 6.10 Publicité homepage */}
      <AdSlot placement="HOMEPAGE" />

      {/* 6.4 Dernières nouvelles */}
      <section>
        <SectionHeading title="Dernières nouvelles" href="/actualites" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((article) => (
            <ArticleCard key={article.id} article={article} size="medium" />
          ))}
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-14">
          {/* 6.7 Catégories */}
          <section>
            <SectionHeading title="Catégories" href="/actualites" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categorie/${category.slug}`}
                  className="rounded-lg border border-border bg-card p-4 text-center transition hover:border-primary hover:shadow-sm"
                >
                  <p className="font-heading font-semibold text-foreground">{category.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category._count.articles} article{category._count.articles > 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 6.6 Tendances (sidebar) */}
        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                Tendances
              </h2>
            </div>
            <ol className="space-y-4">
              {trending.map((article, index) => (
                <li key={article.id} className="flex gap-3">
                  <span className="font-heading text-xl font-bold text-muted-foreground/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link href={`/article/${article.slug}`} className="group">
                    <p className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                      {article.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{article.categoryName}</p>
                  </Link>
                </li>
              ))}
              {trending.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune tendance pour le moment.</p>
              )}
            </ol>
          </div>

          {/* 6.10 Emplacement publicitaire sidebar */}
          <AdSlot placement="SIDEBAR" />
        </aside>
      </div>

      {/* 6.9 Newsletter */}
      <NewsletterSection />
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      <Link href={href} className="text-sm font-medium text-primary hover:underline">
        Voir tout →
      </Link>
    </div>
  );
}
