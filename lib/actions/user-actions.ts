"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, can } from "@/lib/security/permissions";
import { createUserSchema, updateUserSchema } from "@/lib/validation/user";

export interface UserFormState {
  error?: string;
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "users.manage");

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Seul un SUPER_ADMIN peut créer un compte SUPER_ADMIN ou ADMIN, pour éviter
  // qu'un simple ADMIN ne s'auto-élève en contournant les permissions.
  if (
    (parsed.data.role === "SUPER_ADMIN" || parsed.data.role === "ADMIN") &&
    !can(session.user.role, "users.manage.roles")
  ) {
    return { error: "Seul un Super Administrateur peut attribuer ce rôle." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      status: "ACTIF",
    },
  });

  await prisma.auditLog.create({
    data: { action: "user.create", resource: `User:${user.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function updateUserAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "users.manage");

  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Utilisateur introuvable." };

  const roleChanged = target.role !== parsed.data.role;
  const touchesCriticalRole =
    ["SUPER_ADMIN", "ADMIN"].includes(target.role) || ["SUPER_ADMIN", "ADMIN"].includes(parsed.data.role);

  if (roleChanged && touchesCriticalRole && !can(session.user.role, "users.manage.roles")) {
    return { error: "Seul un Super Administrateur peut modifier ce rôle." };
  }

  if (userId === session.user.id && roleChanged) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, role: parsed.data.role, status: parsed.data.status },
  });

  await prisma.auditLog.create({
    data: {
      action: roleChanged ? "user.role_change" : "user.update",
      resource: `User:${userId}`,
      userId: session.user.id,
      metadata: roleChanged ? JSON.stringify({ from: target.role, to: parsed.data.role }) : undefined,
    },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function deleteUserAction(userId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "users.manage");

  if (userId === session.user.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (target && ["SUPER_ADMIN", "ADMIN"].includes(target.role) && !can(session.user.role, "users.manage.roles")) {
    throw new Error("Seul un Super Administrateur peut supprimer ce compte.");
  }

  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: { action: "user.delete", resource: `User:${userId}`, userId: session.user.id },
  });

  revalidatePath("/admin/utilisateurs");
}
