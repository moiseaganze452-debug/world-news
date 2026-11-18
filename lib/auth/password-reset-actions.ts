"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordRequestSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { email as emailProvider } from "@/lib/email";
import { passwordResetEmailTemplate } from "@/lib/email/templates";
import { getSiteTheme } from "@/lib/seo/theme";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { logSecurityEvent } from "@/lib/security/audit-log";

export interface ResetRequestState {
  error?: string;
  success?: boolean;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure (§ cohérent avec le texte du template)

/**
 * Demande de réinitialisation (§3 : "récupération de mot de passe").
 * Réutilise le modèle VerificationToken (déjà requis par l'adapter Auth.js)
 * avec un identifier préfixé pour distinguer un token de reset d'un token
 * de vérification d'email, sans ajouter de table dédiée.
 */
export async function requestPasswordResetAction(
  _prevState: ResetRequestState,
  formData: FormData
): Promise<ResetRequestState> {
  const ip = await getClientIp();

  // §19/§34 — évite le flood d'emails de reset (nuisance + abus du
  // provider d'envoi). Limite par IP volontairement large pour ne pas
  // gêner un usage légitime répété (mot de passe oublié plusieurs fois).
  const rateLimitResult = await checkRateLimit("passwordResetRequest", ip);
  if (!rateLimitResult.success) {
    return { error: rateLimitResult.message };
  }

  const parsed = resetPasswordRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Adresse email invalide." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Ne jamais révéler si l'email existe ou non (évite l'énumération de comptes) :
  // on retourne toujours un succès générique côté UI, mais on n'envoie l'email
  // que si le compte existe réellement.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const identifier = `password-reset:${parsed.data.email}`;

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: { identifier, token, expires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const theme = await getSiteTheme();
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/reinitialiser-mot-de-passe?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;

    await emailProvider.send({
      to: parsed.data.email,
      subject: `Réinitialisation de votre mot de passe — ${theme.identity.siteName}`,
      html: passwordResetEmailTemplate({ siteName: theme.identity.siteName, resetUrl }),
    });

    await logSecurityEvent({ type: "password_reset_requested", ipAddress: ip, resource: `User:${user.id}` });
  }

  return { success: true };
}

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const ip = await getClientIp();

  const rateLimitResult = await checkRateLimit("passwordResetSubmit", ip);
  if (!rateLimitResult.success) {
    return { error: rateLimitResult.message };
  }

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const emailValue = formData.get("email")?.toString();
  if (!emailValue) return { error: "Lien de réinitialisation invalide." };

  const identifier = `password-reset:${emailValue}`;
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token: parsed.data.token } },
  });

  if (!record || record.expires < new Date()) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  // §8/§71 — un changement de mot de passe doit invalider toutes les
  // sessions existantes (celles qu'un attaquant aurait pu établir avec
  // l'ancien mot de passe). sessionVersion incrémenté ici sera comparé
  // au JWT existant lors de la prochaine requête (voir lib/auth/config.ts).
  const updatedUser = await prisma.user.update({
    where: { email: emailValue },
    data: { password: hashedPassword, sessionVersion: { increment: 1 } },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token: parsed.data.token } },
  });

  await logSecurityEvent({
    type: "password_reset_completed",
    userId: updatedUser.id,
    ipAddress: ip,
  });

  return { success: true };
}
