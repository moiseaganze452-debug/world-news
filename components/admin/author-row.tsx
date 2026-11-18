"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteAuthorAction } from "@/lib/actions/author-actions";

interface AuthorRowData {
  id: string;
  displayName: string;
  position: string | null;
  specialty: string | null;
  articleCount: number;
}

export function AuthorRow({ author, canManage }: { author: AuthorRowData; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer le profil de « ${author.displayName} » ?`)) return;
    startTransition(async () => {
      try {
        await deleteAuthorAction(author.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erreur lors de la suppression.");
      }
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">{author.displayName}</td>
      <td className="px-4 py-3 text-muted-foreground">{author.position ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{author.specialty ?? "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{author.articleCount}</td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-3">
            <Link href={`/admin/auteurs/${author.id}`} className="text-xs text-primary hover:underline">
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-destructive hover:underline disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
