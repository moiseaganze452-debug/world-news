import { Resend } from "resend";
import type { EmailProvider, SendEmailInput } from "@/lib/email/types";

/**
 * Implémentation Resend (https://resend.com). Nécessite RESEND_API_KEY
 * et EMAIL_FROM dans .env. Le package "resend" est déjà dans package.json.
 */
export class ResendProvider implements EmailProvider {
  private client = new Resend(process.env.RESEND_API_KEY);
  private defaultFrom = process.env.EMAIL_FROM ?? "World News <no-reply@world-news.com>";

  async send(input: SendEmailInput): Promise<{ success: boolean; messageId?: string }> {
    const { data, error } = await this.client.emails.send({
      from: input.from ?? this.defaultFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error("[ResendProvider] Échec d'envoi :", error);
      return { success: false };
    }

    return { success: true, messageId: data?.id };
  }
}
