import { prisma } from "@/lib/db/prisma";
import type { NotificationType } from "@prisma/client";

/**
 * Point d'entrée unique pour créer une notification admin (§34).
 * Appelé depuis les Server Actions concernées (nouveau commentaire à modérer,
 * nouvel abonné newsletter, publication programmée, etc.) plutôt que d'écrire
 * directement dans prisma.notification.create un peu partout.
 */
export async function createNotification(params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  userId?: string;
}) {
  return prisma.notification.create({
    data: {
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      userId: params.userId,
    },
  });
}

export async function getUnreadNotifications(userId: string, take = 20) {
  return prisma.notification.findMany({
    where: { OR: [{ userId }, { userId: null }], isRead: false },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getAllNotifications(userId: string, take = 50) {
  return prisma.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take,
  });
}
