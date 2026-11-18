import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { PageRow } from "@/components/admin/page-row";

export const metadata = { title: "Pages" };

export default async function PagesPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "pages.manage");

  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pages personnalisées (à propos, contact, mentions légales...).
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/pages/nouvelle"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Nouvelle page
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune page pour le moment.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <PageRow
                  key={page.id}
                  page={{ id: page.id, title: page.title, slug: page.slug, status: page.status }}
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
