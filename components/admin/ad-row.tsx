"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteAdAction } from "@/lib/actions/advertisement-actions";

interface AdRowData {
  id: string;
  name: string;
  placementLabel: string;
  status: "ACTIVE" | "INACTIVE" | "PROGRAMMEE" | "EXPIREE";
  impressions: number;
  clicks: number;
}

const STATUS_STYLES: Record<AdRowData["status"], string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-muted text-muted-foreground",
  PROGRAMMEE: "bg-blue-100 text-blue-700",
  EXPIREE: "bg-red-100 text-red-700",
};

export function AdRow({ ad, canManage }: { ad: AdRowData; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer la publicité « ${ad.name} » ?`)) return;
    startTransition(() => deleteAdAction(ad.id));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">{ad.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{ad.placementLabel}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[ad.status]}`}>{ad.status}</span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{ad.impressions.toLocaleString("fr-FR")}</td>
      <td className="px-4 py-3 text-muted-foreground">{ad.clicks.toLocaleString("fr-FR")}</td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-3">
            <Link href={`/admin/publicites/${ad.id}`} className="text-xs text-primary hover:underline">
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
