import { auth } from "@/lib/auth";
import { getAllNotifications } from "@/services/notification-service";
import { NotificationRow } from "@/components/admin/notification-row";
import { MarkAllReadButton } from "@/components/admin/mark-all-read-button";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) return null;

  const notifications = await getAllNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucune notification.</p>
        ) : (
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={{
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                link: n.link,
                isRead: n.isRead,
                createdAt: n.createdAt,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
