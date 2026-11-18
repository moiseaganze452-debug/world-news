"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { seoSettingsSchema } from "@/lib/validation/seo-settings";

export interface SeoFormState {
  error?: string;
  success?: boolean;
}

export async function saveSeoSettingsAction(
  _prevState: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "seo.manage");

  const parsed = seoSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const existing = await prisma.seoSetting.findFirst();

  if (existing) {
    await prisma.seoSetting.update({ where: { id: existing.id }, data: parsed.data });
  } else {
    await prisma.seoSetting.create({ data: parsed.data });
  }

  await prisma.auditLog.create({
    data: { action: "settings.seo_update", userId: session.user.id },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");

  return { success: true };
}
