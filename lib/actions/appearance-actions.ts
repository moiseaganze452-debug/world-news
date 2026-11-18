"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { appearanceSchema } from "@/lib/validation/appearance";

export interface AppearanceFormState {
  error?: string;
  success?: boolean;
}

/**
 * Écrit dans la table Setting avec les MÊMES clés que celles lues par
 * lib/seo/theme.ts (colors.*, identity.*, typography.*, general.defaultThemeMode).
 * Ne jamais renommer une clé ici sans mettre à jour theme.ts en conséquence.
 */
export async function saveAppearanceAction(
  _prevState: AppearanceFormState,
  formData: FormData
): Promise<AppearanceFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "appearance.manage");

  const parsed = appearanceSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
    colorPrimary: formData.get("colorPrimary"),
    colorSecondary: formData.get("colorSecondary"),
    colorAccent: formData.get("colorAccent"),
    colorBackground: formData.get("colorBackground"),
    colorText: formData.get("colorText"),
    fontPrimary: formData.get("fontPrimary"),
    fontHeading: formData.get("fontHeading"),
    defaultMode: formData.get("defaultMode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const d = parsed.data;
  const entries: Array<{ key: string; value: string; group: string }> = [
    { key: "identity.siteName", value: d.siteName, group: "identite" },
    { key: "identity.tagline", value: d.tagline ?? "", group: "identite" },
    { key: "identity.logoUrl", value: d.logoUrl ?? "", group: "identite" },
    { key: "identity.faviconUrl", value: d.faviconUrl ?? "", group: "identite" },
    { key: "colors.primary", value: d.colorPrimary, group: "couleurs" },
    { key: "colors.secondary", value: d.colorSecondary, group: "couleurs" },
    { key: "colors.accent", value: d.colorAccent, group: "couleurs" },
    { key: "colors.background", value: d.colorBackground, group: "couleurs" },
    { key: "colors.text", value: d.colorText, group: "couleurs" },
    { key: "typography.fontPrimary", value: d.fontPrimary, group: "typographie" },
    { key: "typography.fontHeading", value: d.fontHeading, group: "typographie" },
    { key: "general.defaultThemeMode", value: d.defaultMode, group: "general" },
  ];

  await prisma.$transaction(
    entries.map((e) =>
      prisma.setting.upsert({
        where: { key: e.key },
        update: { value: e.value, group: e.group },
        create: e,
      })
    )
  );

  await prisma.auditLog.create({
    data: { action: "settings.appearance_update", userId: session.user.id },
  });

  // La homepage et toutes les pages publiques lisent le thème à chaque requête
  // (Server Component non caché statiquement) — revalidatePath("/") suffit à
  // rafraîchir immédiatement le rendu après sauvegarde.
  revalidatePath("/", "layout");
  revalidatePath("/admin/apparence");

  return { success: true };
}
