import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { SubscriberRow } from "@/components/admin/subscriber-row";
import { CampaignForm } from "@/components/admin/campaign-form";
import { CampaignRow } from "@/components/admin/campaign-row";

export const metadata = { title: "Newsletter" };

export default async function NewsletterPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "newsletter.manage");

  const [subscribers, campaigns, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" }, take: 100 }),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIF" } }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount} abonné{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <a
            href="/api/newsletter/export"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Exporter en CSV
          </a>
        )}
      </div>

      <section>
        <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Campagnes</h2>

        {canManage && (
          <div className="mb-6 rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Nouvelle campagne</h3>
            <CampaignForm />
          </div>
        )}

        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Objet</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Destinataires</th>
                <th className="px-4 py-3 font-medium">Envoyée le</th>
                {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune campagne pour le moment.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <CampaignRow
                    key={c.id}
                    campaign={{
                      id: c.id,
                      subject: c.subject,
                      status: c.status,
                      recipientCount: c.recipientCount,
                      sentAt: c.sentAt,
                    }}
                    canManage={canManage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-bold text-foreground">Abonnés récents</h2>
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Inscrit le</th>
                {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun abonné pour le moment.
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <SubscriberRow
                    key={s.id}
                    subscriber={{
                      id: s.id,
                      email: s.email,
                      status: s.status,
                      subscribedAt: s.subscribedAt,
                    }}
                    canManage={canManage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
