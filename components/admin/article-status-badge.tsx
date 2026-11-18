import type { ArticleStatus } from "@prisma/client";

const STATUS_STYLES: Record<ArticleStatus, string> = {
  BROUILLON: "bg-muted text-muted-foreground",
  EN_RELECTURE: "bg-amber-100 text-amber-800",
  PROGRAMME: "bg-blue-100 text-blue-800",
  PUBLIE: "bg-emerald-100 text-emerald-800",
  ARCHIVE: "bg-zinc-200 text-zinc-600",
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  BROUILLON: "Brouillon",
  EN_RELECTURE: "En relecture",
  PROGRAMME: "Programmé",
  PUBLIE: "Publié",
  ARCHIVE: "Archivé",
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
