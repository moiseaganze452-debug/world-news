"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  await prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  await prisma.notification.updateMany({
    where: { OR: [{ userId: session.user.id }, { userId: null }], isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/admin/notifications");
}

export async function deleteNotificationAction(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  await prisma.notification.delete({ where: { id: notificationId } });
  revalidatePath("/admin/notifications");
}
