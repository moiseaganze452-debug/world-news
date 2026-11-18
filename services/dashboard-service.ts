import { prisma } from "@/lib/db/prisma";

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalUsers: number;
  pendingComments: number;
  totalViews: number;
  newsletterSubscribers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    scheduledArticles,
    totalUsers,
    pendingComments,
    viewsAggregate,
    newsletterSubscribers,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLIE" } }),
    prisma.article.count({ where: { status: "BROUILLON" } }),
    prisma.article.count({ where: { status: "PROGRAMME" } }),
    prisma.user.count(),
    prisma.comment.count({ where: { status: "EN_ATTENTE" } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIF" } }),
  ]);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    scheduledArticles,
    totalUsers,
    pendingComments,
    totalViews: viewsAggregate._sum.viewCount ?? 0,
    newsletterSubscribers,
  };
}

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  categoryName: string;
}

export async function getTopArticles(limit = 5): Promise<TopArticle[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLIE" },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      category: { select: { name: true } },
    },
  });

  return articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    viewCount: a.viewCount,
    categoryName: a.category.name,
  }));
}

export interface RecentActivity {
  id: string;
  action: string;
  resource: string | null;
  userName: string | null;
  createdAt: Date;
}

export async function getRecentActivity(limit = 8): Promise<RecentActivity[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    userName: log.user?.name ?? "Système",
    createdAt: log.createdAt,
  }));
}
