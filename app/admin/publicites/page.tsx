import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { AdRow } from "@/components/admin/ad-row";

export const metadata = { title: "Publicités" };

const PLACEMENT_LABELS: Record<string, string> = {
  HEADER: "En-tête",
  HOMEPAGE: "Page d'accueil",
  ENTRE_ARTICLES: "Entre les articles",
  SIDEBAR: "Barre latérale",
  ARTICLE: "Dans l'article",
  FOOTER: "Pied de page",
  MOBILE: "Mobile",
};

export default async function AdvertisementsPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "ads.manage");

  const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publicités</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les emplacements publicitaires du site.
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/publicites/nouvelle"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Nouvelle publicité
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Emplacement</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Impressions</th>
              <th className="px-4 py-3 font-medium">Clics</th>
              {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune publicité pour le moment.
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <AdRow
                  key={ad.id}
                  ad={{
                    id: ad.id,
                    name: ad.name,
                    placementLabel: PLACEMENT_LABELS[ad.placement] ?? ad.placement,
                    status: ad.status,
                    impressions: ad.impressions,
                    clicks: ad.clicks,
                  }}
                  canManage={canManage}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
