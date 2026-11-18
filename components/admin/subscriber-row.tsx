"use client";

import { useTransition } from "react";
import { deleteSubscriberAction } from "@/lib/actions/newsletter-actions";
import { formatFullDate } from "@/lib/utils/format-date";

interface SubscriberRowData {
  id: string;
  email: string;
  status: "ACTIF" | "DESABONNE";
  subscribedAt: Date;
}

export function SubscriberRow({ subscriber, canManage }: { subscriber: SubscriberRowData; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer l'abonné « ${subscriber.email} » ?`)) return;
    startTransition(() => deleteSubscriberAction(subscriber.id));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-foreground">{subscriber.email}</td>
      <td className="px-4 py-3">
        <span
          className={
            subscriber.status === "ACTIF"
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
              : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          }
        >
          {subscriber.status === "ACTIF" ? "Actif" : "Désabonné"}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatFullDate(subscriber.subscribedAt)}</td>
      {canManage && (
        <td className="px-4 py-3 text-right">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
          >
            Supprimer
          </button>
        </td>
      )}
    </tr>
  );
}
