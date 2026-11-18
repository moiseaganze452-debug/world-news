"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { authorSchema } from "@/lib/validation/author";
import { toUniqueSlug } from "@/lib/utils/slug";

export interface AuthorFormState {
  error?: string;
}

export async function createAuthorAction(
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "authors.manage");

  const parsed = authorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const existingProfile = await prisma.author.findUnique({ where: { userId: parsed.data.userId } });
  if (existingProfile) {
    return { error: "Cet utilisateur possède déjà un profil auteur." };
  }

  const slug =
    parsed.data.slug ||
    (await toUniqueSlug(parsed.data.displayName, async (candidate) => {
      const existing = await prisma.author.findUnique({ where: { slug: candidate } });
      return !!existing;
    }));

  const author = await prisma.author.create({ data: { ...parsed.data, slug } });

  await prisma.auditLog.create({
    data: { action: "author.create", resource: `Author:${author.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/auteurs");
  redirect("/admin/auteurs");
}

export async function updateAuthorAction(
  authorId: string,
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "authors.manage");

  const parsed = authorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await prisma.author.update({ where: { id: authorId }, data: parsed.data });

  await prisma.auditLog.create({
    data: { action: "author.update", resource: `Author:${authorId}`, userId: session.user.id },
  });

  revalidatePath("/admin/auteurs");
  redirect("/admin/auteurs");
}

export async function deleteAuthorAction(authorId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "authors.manage");

  const articleCount = await prisma.article.count({ where: { authorId } });
  if (articleCount > 0) {
    throw new Error(`Impossible de supprimer : ${articleCount} article(s) associés à ce profil.`);
  }

  await prisma.author.delete({ where: { id: authorId } });

  await prisma.auditLog.create({
    data: { action: "author.delete", resource: `Author:${authorId}`, userId: session.user.id },
  });

  revalidatePath("/admin/auteurs");
}
