"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { menuItemSchema } from "@/lib/validation/menu";
import { toUniqueSlug } from "@/lib/utils/slug";

export interface MenuFormState {
  error?: string;
}

async function assertMenuPermission() {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "menus.manage");
  return session;
}

export async function createMenuAction(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const session = await assertMenuPermission();

  const name = formData.get("name")?.toString().trim();
  if (!name || name.length < 2) {
    return { error: "Nom du menu invalide." };
  }

  const slug = await toUniqueSlug(name, async (candidate) => {
    const existing = await prisma.menu.findUnique({ where: { slug: candidate } });
    return !!existing;
  });

  const menu = await prisma.menu.create({ data: { name, slug } });

  await prisma.auditLog.create({
    data: { action: "menu.create", resource: `Menu:${menu.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/menus");
  return {};
}

export async function addMenuItemAction(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const session = await assertMenuPermission();

  const parsed = menuItemSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const lastItem = await prisma.menuItem.findFirst({
    where: { menuId: parsed.data.menuId, parentId: parsed.data.parentId || null },
    orderBy: { order: "desc" },
  });

  await prisma.menuItem.create({
    data: {
      menuId: parsed.data.menuId,
      label: parsed.data.label,
      type: parsed.data.type,
      targetId: parsed.data.targetId || null,
      url: parsed.data.url || null,
      parentId: parsed.data.parentId || null,
      order: (lastItem?.order ?? -1) + 1,
    },
  });

  await prisma.auditLog.create({
    data: { action: "menu_item.create", resource: `Menu:${parsed.data.menuId}`, userId: session.user.id },
  });

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
  return {};
}

export async function deleteMenuItemAction(itemId: string): Promise<void> {
  const session = await assertMenuPermission();

  const item = await prisma.menuItem.delete({ where: { id: itemId } });

  await prisma.auditLog.create({
    data: { action: "menu_item.delete", resource: `Menu:${item.menuId}`, userId: session.user.id },
  });

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

/**
 * Réordonne les items d'un même niveau de menu après un glisser-déposer
 * (§18 : "modifier l'ordre" en drag & drop). Reçoit la liste des IDs dans
 * leur nouvel ordre et réécrit le champ `order` en conséquence.
 */
export async function reorderMenuItemsAction(orderedItemIds: string[]): Promise<void> {
  const session = await assertMenuPermission();

  await prisma.$transaction(
    orderedItemIds.map((id, index) =>
      prisma.menuItem.update({ where: { id }, data: { order: index } })
    )
  );

  await prisma.auditLog.create({
    data: { action: "menu_item.reorder", userId: session.user.id },
  });

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}

export async function deleteMenuAction(menuId: string): Promise<void> {
  const session = await assertMenuPermission();

  await prisma.menu.delete({ where: { id: menuId } });

  await prisma.auditLog.create({
    data: { action: "menu.delete", resource: `Menu:${menuId}`, userId: session.user.id },
  });

  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}
