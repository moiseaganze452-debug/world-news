"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePageAction } from "@/lib/actions/page-actions";

interface PageRowData {
  id: string;
  title: string;
  slug: string;
  status: "BROUILLON" | "PUBLIE";
}

export function PageRow({ page, canManage }: { page: PageRowData; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer la page « ${page.title} » ?`)) return;
    startTransition(() => deletePageAction(page.id));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">{page.title}</td>
      <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
      <td className="px-4 py-3">
        <span
          className={
            page.status === "PUBLIE"
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
              : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          }
        >
          {page.status === "PUBLIE" ? "Publiée" : "Brouillon"}
        </span>
      </td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-3">
            <Link href={`/admin/pages/${page.id}`} className="text-xs text-primary hover:underline">
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
