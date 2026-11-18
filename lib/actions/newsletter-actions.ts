"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/security/permissions";
import { email } from "@/lib/email";
import { newsletterCampaignTemplate } from "@/lib/email/templates";
import { getSiteTheme } from "@/lib/seo/theme";

export interface NewsletterFormState {
  error?: string;
}

async function assertNewsletterPermission() {
  const session = await auth();
  if (!session) redirect("/admin/connexion");
  requirePermission(session.user.role, "newsletter.manage");
  return session;
}

export async function deleteSubscriberAction(subscriberId: string): Promise<void> {
  const session = await assertNewsletterPermission();

  await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });

  await prisma.auditLog.create({
    data: { action: "newsletter.subscriber_delete", resource: `NewsletterSubscriber:${subscriberId}`, userId: session.user.id },
  });

  revalidatePath("/admin/newsletter");
}

export async function createCampaignAction(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const session = await assertNewsletterPermission();

  const subject = formData.get("subject")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!subject || subject.length < 2) return { error: "Objet requis." };
  if (!content || content.length < 2) return { error: "Contenu requis." };

  const activeCount = await prisma.newsletterSubscriber.count({ where: { status: "ACTIF" } });

  const campaign = await prisma.newsletterCampaign.create({
    data: { subject, content, status: "BROUILLON", recipientCount: activeCount },
  });

  await prisma.auditLog.create({
    data: { action: "newsletter.campaign_create", resource: `NewsletterCampaign:${campaign.id}`, userId: session.user.id },
  });

  revalidatePath("/admin/newsletter");
  return {};
}

/**
 * Envoie réellement la campagne à tous les abonnés actifs via le provider
 * configuré (lib/email — Resend ou SMTP selon EMAIL_PROVIDER), puis marque
 * la campagne comme ENVOYEE. Envoi par lots pour éviter de dépasser les
 * limites de taux des providers sur de grosses listes d'abonnés.
 */
const BATCH_SIZE = 50;

export async function sendCampaignAction(campaignId: string): Promise<void> {
  const session = await assertNewsletterPermission();

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campagne introuvable.");
  if (campaign.status === "ENVOYEE") throw new Error("Cette campagne a déjà été envoyée.");

  const [subscribers, theme] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where: { status: "ACTIF" }, select: { email: true } }),
    getSiteTheme(),
  ]);

  const html = newsletterCampaignTemplate({ siteName: theme.identity.siteName, content: campaign.content });

  let sentCount = 0;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((s) => email.send({ to: s.email, subject: campaign.subject, html }))
    );
    sentCount += results.filter((r) => r.status === "fulfilled" && r.value.success).length;
  }

  await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: { status: "ENVOYEE", sentAt: new Date(), recipientCount: sentCount },
  });

  await prisma.auditLog.create({
    data: {
      action: "newsletter.campaign_send",
      resource: `NewsletterCampaign:${campaignId}`,
      userId: session.user.id,
      metadata: JSON.stringify({ recipientCount: subscribers.length, sentCount }),
    },
  });

  revalidatePath("/admin/newsletter");
}

export async function deleteCampaignAction(campaignId: string): Promise<void> {
  const session = await assertNewsletterPermission();

  await prisma.newsletterCampaign.delete({ where: { id: campaignId } });

  await prisma.auditLog.create({
    data: { action: "newsletter.campaign_delete", resource: `NewsletterCampaign:${campaignId}`, userId: session.user.id },
  });

  revalidatePath("/admin/newsletter");
}
