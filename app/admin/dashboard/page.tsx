import {
  Newspaper,
  CheckCircle2,
  FileEdit,
  Clock,
  Users,
  MessageSquareWarning,
  Eye,
  Mail,
} from "lucide-react";
import { getDashboardStats, getTopArticles, getRecentActivity } from "@/services/dashboard-service";
import { StatCard } from "@/components/admin/stat-card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [stats, topArticles, recentActivity] = await Promise.all([
    getDashboardStats(),
    getTopArticles(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vue générale</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aperçu de l'activité éditoriale de World News.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Articles au total" value={stats.totalArticles} icon={Newspaper} />
        <StatCard label="Publiés" value={stats.publishedArticles} icon={CheckCircle2} />
        <StatCard label="Brouillons" value={stats.draftArticles} icon={FileEdit} />
        <StatCard label="Programmés" value={stats.scheduledArticles} icon={Clock} />
        <StatCard label="Utilisateurs" value={stats.totalUsers} icon={Users} />
        <StatCard label="Commentaires à modérer" value={stats.pendingComments} icon={MessageSquareWarning} />
        <StatCard label="Vues cumulées" value={stats.totalViews.toLocaleString("fr-FR")} icon={Eye} />
        <StatCard label="Abonnés newsletter" value={stats.newsletterSubscribers} icon={Mail} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Articles les plus lus</h2>
          {topArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun article publié pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {topArticles.map((article, index) => (
                <li key={article.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-muted-foreground">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.categoryName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {article.viewCount.toLocaleString("fr-FR")} vues
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Activité récente</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((log) => (
                <li key={log.id} className="text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{log.userName}</span> — {log.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(log.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
