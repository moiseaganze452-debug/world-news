"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/lib/actions/notification-actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
      disabled={isPending}
      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
    >
      Tout marquer comme lu
    </button>
  );
}
