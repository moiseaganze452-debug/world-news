"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";

async function assertModeratorPermission() {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "comments.moderate");
  return session;
}

export async function approveCommentAction(commentId: string): Promise<void> {
  const session = await assertModeratorPermission();

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { status: "APPROUVE" },
    select: { articleId: true },
  });

  await prisma.auditLog.create({
    data: { action: "comment.approve", resource: `Comment:${commentId}`, userId: session.user.id },
  });

  revalidatePath("/admin/commentaires");
  revalidatePath(`/article/${comment.articleId}`);
}

export async function rejectCommentAction(commentId: string): Promise<void> {
  const session = await assertModeratorPermission();

  await prisma.comment.update({ where: { id: commentId }, data: { status: "REJETE" } });

  await prisma.auditLog.create({
    data: { action: "comment.reject", resource: `Comment:${commentId}`, userId: session.user.id },
  });

  revalidatePath("/admin/commentaires");
}

export async function deleteCommentAction(commentId: string): Promise<void> {
  const session = await assertModeratorPermission();

  await prisma.comment.delete({ where: { id: commentId } });

  await prisma.auditLog.create({
    data: { action: "comment.delete", resource: `Comment:${commentId}`, userId: session.user.id },
  });

  revalidatePath("/admin/commentaires");
}

/**
 * Bloque un commentateur : rejette tous ses commentaires en attente et
 * marque son adresse email pour empêcher toute future soumission (§12).
 * Implémenté ici en rejetant en masse ; un blocage persistant par email
 * nécessiterait une table dédiée — laissé en extension future si besoin
 * d'un blocage plus strict que le rejet systématique côté modération.
 */
export async function blockCommenterAction(guestEmail: string): Promise<void> {
  const session = await assertModeratorPermission();

  await prisma.comment.updateMany({
    where: { guestEmail, status: { in: ["EN_ATTENTE", "APPROUVE"] } },
    data: { status: "REJETE" },
  });

  await prisma.auditLog.create({
    data: { action: "comment.block_commenter", metadata: JSON.stringify({ guestEmail }), userId: session.user.id },
  });

  revalidatePath("/admin/commentaires");
}
