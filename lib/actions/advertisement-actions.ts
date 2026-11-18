"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { can, requirePermission } from "@/lib/security/permissions";
import { advertisementSchema } from "@/lib/validation/advertisement";
import { sanitizeAdHtml } from "@/lib/security/sanitize";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

export interface AdFormState {
  error?: string;
}

async function assertAdPermission() {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "ads.manage");
  return session;
}

/**
 * scriptCode exécute du JavaScript arbitraire sur toutes les pages
 * publiques qui affichent la publicité (§56/§57 — surface XSS critique
 * si un compte AD_MANAGER/ADMIN est compromis). Seul un rôle disposant
 * explicitement de "ads.manage.scripts" (SUPER_ADMIN uniquement par
 * défaut) peut définir ou modifier ce champ ; pour tout autre rôle
 * autorisé à gérer les publicités, htmlCode passe par un sanitizer
 * strict et scriptCode est purement et simplement ignoré/effacé.
 */
function resolveAdCodeFields(
  role: string | undefined,
  input: { htmlCode?: string; scriptCode?: string }
): { htmlCode: string | null; scriptCode: string | null } {
  const canManageScripts = can(role, "ads.manage.scripts");
  return {
    htmlCode: input.htmlCode ? sanitizeAdHtml(input.htmlCode) : null,
    scriptCode: canManageScripts && input.scriptCode ? input.scriptCode : null,
  };
}

export async function createAdAction(
  _prevState: AdFormState,
  formData: FormData
): Promise<AdFormState> {
  const session = await assertAdPermission();

  const parsed = advertisementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const codeFields = resolveAdCodeFields(session.user.role, parsed.data);

  const ad = await prisma.advertisement.create({
    data: {
      name: parsed.data.name,
      placement: parsed.data.placement,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      htmlCode: codeFields.htmlCode,
      scriptCode: codeFields.scriptCode,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      status: parsed.data.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "advertisement.create",
      resource: `Advertisement:${ad.id}`,
      userId: session.user.id,
      metadata: codeFields.scriptCode ? JSON.stringify({ scriptCodeSet: true }) : undefined,
    },
  });

  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
  redirect("/admin/publicites");
}

export async function updateAdAction(
  adId: string,
  _prevState: AdFormState,
  formData: FormData
): Promise<AdFormState> {
  const session = await assertAdPermission();

  const parsed = advertisementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const codeFields = resolveAdCodeFields(session.user.role, parsed.data);

  await prisma.advertisement.update({
    where: { id: adId },
    data: {
      name: parsed.data.name,
      placement: parsed.data.placement,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      htmlCode: codeFields.htmlCode,
      scriptCode: codeFields.scriptCode,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      status: parsed.data.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "advertisement.update",
      resource: `Advertisement:${adId}`,
      userId: session.user.id,
      metadata: codeFields.scriptCode ? JSON.stringify({ scriptCodeSet: true }) : undefined,
    },
  });

  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
  redirect("/admin/publicites");
}

export async function deleteAdAction(adId: string): Promise<void> {
  const session = await assertAdPermission();

  await prisma.advertisement.delete({ where: { id: adId } });

  await prisma.auditLog.create({
    data: { action: "advertisement.delete", resource: `Advertisement:${adId}`, userId: session.user.id },
  });

  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
}

export async function recordAdClick(adId: string): Promise<void> {
  const ip = await getClientIp();
  const rateLimitResult = await checkRateLimit("adTracking", `click:${ip}`);
  if (!rateLimitResult.success) return;

  // §10/§43 — pas d'erreur non gérée exposée si l'id n'existe pas/plus
  // (ressource déjà supprimée, id forgé) : échec silencieux côté
  // tracking, qui n'est pas une opération critique pour l'utilisateur.
  try {
    await prisma.advertisement.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    // Publicité introuvable — rien à faire, ce n'est pas une erreur à
    // remonter à l'utilisateur pour un simple tracking de clic.
  }
}

export async function recordAdImpression(adId: string): Promise<void> {
  const ip = await getClientIp();
  const rateLimitResult = await checkRateLimit("adTracking", `impression:${ip}`);
  if (!rateLimitResult.success) return;

  try {
    await prisma.advertisement.update({
      where: { id: adId },
      data: { impressions: { increment: 1 } },
    });
  } catch {
    // Idem : échec silencieux, pas une opération critique.
  }
}
