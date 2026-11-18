"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Circle, X } from "lucide-react";
import { markNotificationReadAction, deleteNotificationAction } from "@/lib/actions/notification-actions";
import { formatPublishedDate } from "@/lib/utils/format-date";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationRow({ notification }: { notification: NotificationData }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!notification.isRead) {
      startTransition(() => markNotificationReadAction(notification.id));
    }
  }

  const content = (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 rounded-lg border border-border p-4 transition ${
        notification.isRead ? "bg-card" : "bg-primary/5"
      } ${notification.link ? "cursor-pointer hover:border-primary" : ""}`}
    >
      {!notification.isRead && <Circle className="mt-1 h-2 w-2 shrink-0 fill-primary text-primary" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatPublishedDate(notification.createdAt)}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          startTransition(() => deleteNotificationAction(notification.id));
        }}
        disabled={isPending}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}
