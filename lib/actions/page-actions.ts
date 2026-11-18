"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { pageSchema } from "@/lib/validation/page";
import { toUniqueSlug } from "@/lib/utils/slug";
import { sanitizeArticleHtml } from "@/lib/security/sanitize";

export interface PageFormState {
  error?: string;
}

const RESERVED_SLUGS = new Set([
  "admin", "api", "article", "categorie", "auteur", "recherche",
  "actualites", "video", "connexion",
]);

export async function createPageAction(
  _prevState: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "pages.manage");

  const parsed = pageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const desiredSlug = parsed.data.slug || parsed.data.title;
  if (RESERVED_SLUGS.has(desiredSlug.toLowerCase())) {
    return { error: `« ${desiredSlug} » est une URL réservée par le système. Choisissez un autre nom.` };
  }

  const slug = await toUniqueSlug(desiredSlug, async (candidate) => {
    const existing = await prisma.page.findUnique({ where: { slug: candidate } });
    return !!existing;
  });

  // §13/§57 — le contenu HTML d'une page est un vecteur de stored XSS
  // direct (rendu public via dangerouslySetInnerHTML) : sanitization
  // stricte à l'écriture, whitelist de balises/attributs, jamais de
  // script ni de handler JS.
  const page = await prisma.page.create({
    data: { ...parsed.data, content: sanitizeArticleHtml(parsed.data.content), slug },
  });

  await prisma.auditLog.create({
    data: { action: "page.create", resource: `Page:${page.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
  redirect("/admin/pages");
}

export async function updatePageAction(
  pageId: string,
  _prevState: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "pages.manage");

  const parsed = pageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const current = await prisma.page.findUnique({ where: { id: pageId } });
  if (!current) return { error: "Page introuvable." };

  await prisma.page.update({
    where: { id: pageId },
    data: { ...parsed.data, content: sanitizeArticleHtml(parsed.data.content) },
  });

  await prisma.auditLog.create({
    data: { action: "page.update", resource: `Page:${pageId}`, userId: session.user.id },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/${current.slug}`);
  redirect("/admin/pages");
}

export async function deletePageAction(pageId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "pages.manage");

  const page = await prisma.page.delete({ where: { id: pageId } });

  await prisma.auditLog.create({
    data: { action: "page.delete", resource: `Page:${pageId}`, userId: session.user.id },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/${page.slug}`);
}
