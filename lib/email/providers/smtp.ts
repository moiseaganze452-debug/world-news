import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailInput } from "@/lib/email/types";

/**
 * Implémentation SMTP générique via nodemailer (déjà en dépendance).
 * Nécessite SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM.
 * Utile pour un hébergeur mail classique quand Resend n'est pas souhaité.
 */
export class SmtpProvider implements EmailProvider {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  private defaultFrom = process.env.EMAIL_FROM ?? "World News <no-reply@world-news.com>";

  async send(input: SendEmailInput): Promise<{ success: boolean; messageId?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: input.from ?? this.defaultFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[SmtpProvider] Échec d'envoi :", error);
      return { success: false };
    }
  }
}
