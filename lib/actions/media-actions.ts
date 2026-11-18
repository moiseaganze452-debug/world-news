"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/security/permissions";
import { prisma } from "@/lib/db/prisma";
import * as mediaService from "@/services/media-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { UserFacingError } from "@/lib/security/user-facing-error";

export interface MediaUploadState {
  error?: string;
  success?: boolean;
}

export async function uploadMediaAction(
  _prevState: MediaUploadState,
  formData: FormData
): Promise<MediaUploadState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "media.manage");

  // §19/§21 — limite même pour un utilisateur authentifié : un compte
  // légitime compromis ne doit pas pouvoir déverser un volume massif de
  // fichiers (coût stockage/bande passante, §DoS ressources).
  const rateLimitResult = await checkRateLimit("mediaUpload", session.user.id);
  if (!rateLimitResult.success) {
    return { error: rateLimitResult.message };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Veuillez sélectionner un fichier." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await mediaService.uploadMedia({
      buffer,
      filename: file.name,
      mimeType: file.type,
      uploadedById: session.user.id,
      altText: formData.get("altText")?.toString(),
      title: formData.get("title")?.toString(),
    });

    await prisma.auditLog.create({
      data: { action: "media.upload", resource: file.name, userId: session.user.id },
    });

    revalidatePath("/admin/medias");
    return { success: true };
  } catch (error) {
    // §43 — seule une UserFacingError (refus métier volontaire, message
    // déjà sûr à afficher) est renvoyée telle quelle au client. Toute
    // autre exception (Prisma, réseau, stockage) reste interne : on la
    // journalise côté serveur et on renvoie un message générique, pour
    // ne jamais exposer de détail technique (stack trace, requête SQL,
    // chemin filesystem) à un utilisateur du dashboard admin.
    if (error instanceof UserFacingError) {
      return { error: error.message };
    }
    console.error("[media-actions] échec upload:", error);
    return { error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer." };
  }
}

export async function deleteMediaAction(mediaId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "media.manage");

  await mediaService.deleteMedia(mediaId);
  await prisma.auditLog.create({
    data: { action: "media.delete", resource: `Media:${mediaId}`, userId: session.user.id },
  });

  revalidatePath("/admin/medias");
}

export async function updateMediaMetadataAction(
  mediaId: string,
  data: { altText?: string; title?: string }
): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "media.manage");

  await mediaService.updateMediaMetadata(mediaId, data);
  revalidatePath("/admin/medias");
}
