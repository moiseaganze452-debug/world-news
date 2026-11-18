"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { categorySchema } from "@/lib/validation/category";
import { toUniqueSlug } from "@/lib/utils/slug";

export interface CategoryFormState {
  error?: string;
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "categories.manage");

  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Formulaire invalide." };

  const slug =
    parsed.data.slug ??
    (await toUniqueSlug(parsed.data.name, async (candidate) => {
      const existing = await prisma.category.findUnique({ where: { slug: candidate } });
      return !!existing;
    }));

  const category = await prisma.category.create({ data: { ...parsed.data, slug } });
  await prisma.auditLog.create({
    data: { action: "category.create", resource: `Category:${category.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "categories.manage");

  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Formulaire invalide." };

  await prisma.category.update({ where: { id: categoryId }, data: parsed.data });
  await prisma.auditLog.create({
    data: { action: "category.update", resource: `Category:${categoryId}`, userId: session.user.id },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "categories.manage");

  const articleCount = await prisma.article.count({ where: { categoryId } });
  if (articleCount > 0) {
    throw new Error(
      `Impossible de supprimer : ${articleCount} article(s) utilisent encore cette catégorie.`
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
  await prisma.auditLog.create({
    data: { action: "category.delete", resource: `Category:${categoryId}`, userId: session.user.id },
  });

  revalidatePath("/admin/categories");
}
