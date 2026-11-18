"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { deleteArticleAction, duplicateArticleAction } from "@/lib/actions/article-actions";

export function ArticleRowActions({ articleId, canDelete }: { articleId: string; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/articles/${articleId}`}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => duplicateArticleAction(articleId))}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        title="Dupliquer"
      >
        <Copy className="h-4 w-4" />
      </button>

      {canDelete &&
        (confirmingDelete ? (
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => deleteArticleAction(articleId))}
              className="rounded-md bg-destructive px-2 py-1 text-destructive-foreground"
            >
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-border px-2 py-1"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ))}
    </div>
  );
}
