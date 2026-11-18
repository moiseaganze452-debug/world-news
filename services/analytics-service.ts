import { prisma } from "@/lib/db/prisma";

/**
 * Agrège les données pour le tableau de bord Statistiques (§35).
 * Les vues par jour sont dérivées de AnalyticsEvent (type PAGE_VIEW/ARTICLE_VIEW)
 * quand ce modèle est peuplé ; en son absence (MVP, aucun tracker front-end
 * n'écrit encore dedans), on retombe sur Article.viewCount pour donner un
 * signal utile dès maintenant plutôt qu'un graphique vide.
 */
export async function getTopArticlesByViews(take = 10) {
  return prisma.article.findMany({
    where: { status: "PUBLIE" },
    orderBy: { viewCount: "desc" },
    take,
    select: { id: true, title: true, slug: true, viewCount: true, category: { select: { name: true } } },
  });
}

export async function getPopularCategories(take = 8) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      articles: { where: { status: "PUBLIE" }, select: { viewCount: true } },
    },
  });

  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalViews: c.articles.reduce((sum, a) => sum + a.viewCount, 0),
      articleCount: c.articles.length,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, take);
}

export async function getAnalyticsEventCounts() {
  const [pageViews, articleViews, searches, newsletterSignups, adClicks] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "PAGE_VIEW" } }),
    prisma.analyticsEvent.count({ where: { type: "ARTICLE_VIEW" } }),
    prisma.analyticsEvent.count({ where: { type: "SEARCH" } }),
    prisma.analyticsEvent.count({ where: { type: "NEWSLETTER_SIGNUP" } }),
    prisma.analyticsEvent.count({ where: { type: "AD_CLICK" } }),
  ]);

  return { pageViews, articleViews, searches, newsletterSignups, adClicks };
}

export async function getGlobalStats() {
  const [totalViews, totalArticles, totalComments, totalSubscribers, totalAdClicks, totalAdImpressions] =
    await Promise.all([
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.count({ where: { status: "PUBLIE" } }),
      prisma.comment.count({ where: { status: "APPROUVE" } }),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIF" } }),
      prisma.advertisement.aggregate({ _sum: { clicks: true } }),
      prisma.advertisement.aggregate({ _sum: { impressions: true } }),
    ]);

  return {
    totalViews: totalViews._sum.viewCount ?? 0,
    totalArticles,
    totalComments,
    totalSubscribers,
    totalAdClicks: totalAdClicks._sum.clicks ?? 0,
    totalAdImpressions: totalAdImpressions._sum.impressions ?? 0,
  };
}
