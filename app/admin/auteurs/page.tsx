import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { AuthorRow } from "@/components/admin/author-row";

export const metadata = { title: "Auteurs" };

export default async function AuthorsPage() {
  const session = await auth();
  const canManage = can(session?.user.role, "authors.manage");

  const authors = await prisma.author.findMany({
    orderBy: { displayName: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auteurs & Journalistes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Profils éditoriaux publics affichés sur les pages /auteur/*.
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/auteurs/nouveau"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Nouvel auteur
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Poste</th>
              <th className="px-4 py-3 font-medium">Spécialité</th>
              <th className="px-4 py-3 font-medium">Articles</th>
              {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {authors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun auteur pour le moment.
                </td>
              </tr>
            ) : (
              authors.map((author) => (
                <AuthorRow
                  key={author.id}
                  author={{
                    id: author.id,
                    displayName: author.displayName,
                    position: author.position,
                    specialty: author.specialty,
                    articleCount: author._count.articles,
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
