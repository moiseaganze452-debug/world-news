"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  approveCommentAction,
  rejectCommentAction,
  deleteCommentAction,
  blockCommenterAction,
} from "@/lib/actions/comment-moderation-actions";
import { formatFullDate } from "@/lib/utils/format-date";

interface CommentData {
  id: string;
  content: string;
  guestName: string | null;
  guestEmail: string | null;
  status: "EN_ATTENTE" | "APPROUVE" | "REJETE" | "SIGNALE";
  createdAt: Date;
  articleTitle: string;
  articleSlug: string;
}

export function CommentModerationRow({ comment, canModerate }: { comment: CommentData; canModerate: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleBlock() {
    if (!comment.guestEmail) return;
    if (!confirm(`Bloquer tous les commentaires de ${comment.guestEmail} ?`)) return;
    startTransition(() => blockCommenterAction(comment.guestEmail!));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{comment.guestName ?? "Anonyme"}</p>
          <p className="text-xs text-muted-foreground">
            {comment.guestEmail} · {formatFullDate(comment.createdAt)}
          </p>
        </div>
        <Link href={`/article/${comment.articleSlug}`} target="_blank" className="shrink-0 text-xs text-primary hover:underline">
          Voir l'article
        </Link>
      </div>

      <p className="mb-3 text-sm text-foreground/90">{comment.content}</p>

      <p className="mb-3 text-xs text-muted-foreground">Sur : {comment.articleTitle}</p>

      {canModerate && (
        <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs">
          {comment.status !== "APPROUVE" && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => approveCommentAction(comment.id))}
              className="text-emerald-600 hover:underline disabled:opacity-50"
            >
              Approuver
            </button>
          )}
          {comment.status !== "REJETE" && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => rejectCommentAction(comment.id))}
              className="text-amber-600 hover:underline disabled:opacity-50"
            >
              Rejeter
            </button>
          )}
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm("Supprimer définitivement ce commentaire ?")) {
                startTransition(() => deleteCommentAction(comment.id));
              }
            }}
            className="text-destructive hover:underline disabled:opacity-50"
          >
            Supprimer
          </button>
          {comment.guestEmail && (
            <button onClick={handleBlock} disabled={isPending} className="text-muted-foreground hover:underline disabled:opacity-50">
              Bloquer cet auteur
            </button>
          )}
        </div>
      )}
    </div>
  );
}
