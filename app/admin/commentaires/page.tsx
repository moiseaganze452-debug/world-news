import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can } from "@/lib/security/permissions";
import { CommentModerationRow } from "@/components/admin/comment-moderation-row";

export const metadata = { title: "Commentaires" };

interface PageProps {
  searchParams: Promise<{ statut?: string }>;
}

export default async function CommentsModerationPage({ searchParams }: PageProps) {
  const { statut } = await searchParams;
  const session = await auth();
  const canModerate = can(session?.user.role, "comments.moderate");

  const status = statut === "approuve" ? "APPROUVE" : statut === "rejete" ? "REJETE" : "EN_ATTENTE";

  const comments = await prisma.comment.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: { article: { select: { title: true, slug: true } } },
  });

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.comment.count({ where: { status: "EN_ATTENTE" } }),
    prisma.comment.count({ where: { status: "APPROUVE" } }),
    prisma.comment.count({ where: { status: "REJETE" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commentaires</h1>
        <p className="mt-1 text-sm text-muted-foreground">Modération des commentaires publiés sur le site.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <FilterTab href="/admin/commentaires" label={`En attente (${pendingCount})`} active={status === "EN_ATTENTE"} />
        <FilterTab href="/admin/commentaires?statut=approuve" label={`Approuvés (${approvedCount})`} active={status === "APPROUVE"} />
        <FilterTab href="/admin/commentaires?statut=rejete" label={`Rejetés (${rejectedCount})`} active={status === "REJETE"} />
      </div>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun commentaire dans cette catégorie.</p>
        ) : (
          comments.map((comment) => (
            <CommentModerationRow
              key={comment.id}
              comment={{
                id: comment.id,
                content: comment.content,
                guestName: comment.guestName,
                guestEmail: comment.guestEmail,
                status: comment.status,
                createdAt: comment.createdAt,
                articleTitle: comment.article.title,
                articleSlug: comment.article.slug,
              }}
              canModerate={canModerate}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </a>
  );
}
