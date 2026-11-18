"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

async function assertSettingsPermission() {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "settings.manage");
  return session;
}

async function upsertSetting(key: string, value: string, group: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value, group },
    create: { key, value, group },
  });
}

export async function saveGeneralSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await assertSettingsPermission();

  const siteUrl = formData.get("siteUrl")?.toString() ?? "";
  const contactEmail = formData.get("contactEmail")?.toString() ?? "";

  await Promise.all([
    upsertSetting("general.siteUrl", siteUrl, "general"),
    upsertSetting("general.contactEmail", contactEmail, "general"),
  ]);

  await prisma.auditLog.create({ data: { action: "settings.general_update", userId: session.user.id } });
  revalidatePath("/admin/parametres");
  return { success: true };
}

export async function saveCommentSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await assertSettingsPermission();

  const autoApprove = formData.get("autoApprove") === "on";
  const commentsEnabled = formData.get("commentsEnabled") === "on";

  await Promise.all([
    upsertSetting("comments.autoApprove", String(autoApprove), "commentaires"),
    upsertSetting("comments.enabled", String(commentsEnabled), "commentaires"),
  ]);

  await prisma.auditLog.create({ data: { action: "settings.comments_update", userId: session.user.id } });
  revalidatePath("/admin/parametres");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveMaintenanceSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await assertSettingsPermission();

  const enabled = formData.get("enabled") === "on";
  const title = formData.get("title")?.toString() ?? "";
  const message = formData.get("message")?.toString() ?? "";

  await Promise.all([
    upsertSetting("maintenance.enabled", String(enabled), "general"),
    upsertSetting("maintenance.title", title, "general"),
    upsertSetting("maintenance.message", message, "general"),
  ]);

  await prisma.auditLog.create({ data: { action: "settings.maintenance_update", userId: session.user.id } });
  revalidatePath("/admin/parametres");
  revalidatePath("/", "layout");
  return { success: true };
}
