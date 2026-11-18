"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { commentSchema } from "@/lib/validation/comment";
import { createNotification } from "@/services/notification-service";
import { sanitizeCommentText } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { logSecurityEvent } from "@/lib/security/audit-log";

export interface CommentFormState {
  error?: string;
  success?: boolean;
}

/**
 * Le statut initial du commentaire (approuvé automatiquement ou en attente
 * de modération) dépend du réglage Admin → Paramètres → Commentaires
 * (Setting: comments.autoApprove) — voir §12 du cahier des charges.
 */
export async function submitCommentAction(
  articleSlug: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const ip = await getClientIp();

  // §19/§52 — anti-spam/flooding avant toute requête base de données.
  const rateLimitResult = await checkRateLimit("commentSubmit", ip);
  if (!rateLimitResult.success) {
    return { error: rateLimitResult.message };
  }

  const parsed = commentSchema.safeParse({
    articleId: formData.get("articleId"),
    content: formData.get("content"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    parentId: formData.get("parentId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // §10/§IDOR — articleId et parentId viennent du client (FormData) : ne
  // jamais faire confiance à ces identifiants sans vérifier qu'ils
  // correspondent réellement à la ressource visée (articleSlug) et,
  // pour parentId, qu'il appartient bien au même article. Sans ce
  // contrôle, un attaquant pourrait attacher un commentaire à un
  // article arbitraire ou usurper un fil de réponse.
  const article = await prisma.article.findUnique({
    where: { slug: articleSlug },
    select: { id: true },
  });
  if (!article || article.id !== parsed.data.articleId) {
    await logSecurityEvent({
      type: "suspicious_request",
      ipAddress: ip,
      resource: `Comment:articleId_mismatch`,
      metadata: { articleSlug },
    });
    return { error: "Article introuvable pour ce commentaire." };
  }

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { articleId: true },
    });
    if (!parent || parent.articleId !== article.id) {
      return { error: "Commentaire parent invalide." };
    }
  }

  const autoApproveSetting = await prisma.setting.findUnique({
    where: { key: "comments.autoApprove" },
  });
  const autoApprove = autoApproveSetting?.value === "true";

  // §13/§52 — le texte du commentaire est rendu publiquement : pas de
  // HTML autorisé, texte brut uniquement.
  await prisma.comment.create({
    data: {
      articleId: parsed.data.articleId,
      content: sanitizeCommentText(parsed.data.content),
      guestName: sanitizeCommentText(parsed.data.guestName),
      guestEmail: parsed.data.guestEmail,
      parentId: parsed.data.parentId,
      status: autoApprove ? "APPROUVE" : "EN_ATTENTE",
    },
  });

  if (!autoApprove) {
    await createNotification({
      type: "COMMENTAIRE_A_MODERER",
      title: "Nouveau commentaire à modérer",
      message: `Un commentaire est en attente de validation.`,
      link: "/admin/commentaires",
    });
  }

  revalidatePath(`/article/${articleSlug}`);
  return { success: true };
}
