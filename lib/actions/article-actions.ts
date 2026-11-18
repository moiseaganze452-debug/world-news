"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission, can } from "@/lib/security/permissions";
import { articleSchema, type ArticleInput } from "@/lib/validation/article";
import * as articleService from "@/services/article-service";
import type { ArticleStatus } from "@prisma/client";

async function logAudit(action: string, resource: string, userId: string) {
  await prisma.auditLog.create({ data: { action, resource, userId } });
}

export interface ArticleFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  requirePermission(session.user.role, "articles.create");

  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.safeParse({
    ...raw,
    isFeatured: raw.isFeatured === "on",
    isTrending: raw.isTrending === "on",
    isSponsored: raw.isSponsored === "on",
    isBreaking: raw.isBreaking === "on",
    tagIds: formData.getAll("tagIds"),
  });

  if (!parsed.success) {
    return { error: "Veuillez corriger les erreurs du formulaire.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // JOURNALIST/AUTHOR ne peuvent publier que via le statut BROUILLON/EN_RELECTURE
  if (parsed.data.status === "PUBLIE" && !can(session.user.role, "articles.publish")) {
    return { error: "Vous n'avez pas la permission de publier directement. Choisissez « En relecture »." };
  }

  const { id } = await articleService.createArticle(parsed.data as ArticleInput, session.user.id);
  await logAudit("article.create", `Article:${id}`, session.user.id);

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticleAction(
  articleId: string,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { createdById: true } });
  if (!article) return { error: "Article introuvable." };

  const isOwner = article.createdById === session.user.id;
  const canEditAll = can(session.user.role, "articles.edit.all");
  const canEditOwn = can(session.user.role, "articles.edit.own") && isOwner;
  if (!canEditAll && !canEditOwn) {
    return { error: "Vous n'avez pas la permission de modifier cet article." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.safeParse({
    ...raw,
    isFeatured: raw.isFeatured === "on",
    isTrending: raw.isTrending === "on",
    isSponsored: raw.isSponsored === "on",
    isBreaking: raw.isBreaking === "on",
    tagIds: formData.getAll("tagIds"),
  });

  if (!parsed.success) {
    return { error: "Veuillez corriger les erreurs du formulaire.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.status === "PUBLIE" && !can(session.user.role, "articles.publish")) {
    return { error: "Vous n'avez pas la permission de publier directement." };
  }

  await articleService.updateArticle(articleId, parsed.data as ArticleInput, session.user.id);
  await logAudit("article.update", `Article:${articleId}`, session.user.id);

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticleAction(articleId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "articles.delete");

  await articleService.deleteArticle(articleId);
  await logAudit("article.delete", `Article:${articleId}`, session.user.id);
  revalidatePath("/admin/articles");
}

export async function duplicateArticleAction(articleId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "articles.create");

  const { id } = await articleService.duplicateArticle(articleId, session.user.id);
  await logAudit("article.duplicate", `Article:${id}`, session.user.id);
  revalidatePath("/admin/articles");
}

export async function bulkUpdateStatusAction(ids: string[], status: ArticleStatus): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "articles.publish");

  await articleService.bulkUpdateStatus(ids, status);
  await logAudit("article.bulk_status", `${ids.length} articles → ${status}`, session.user.id);
  revalidatePath("/admin/articles");
}

export async function bulkDeleteAction(ids: string[]): Promise<void> {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "articles.delete");

  await articleService.bulkDelete(ids);
  await logAudit("article.bulk_delete", `${ids.length} articles`, session.user.id);
  revalidatePath("/admin/articles");
}
