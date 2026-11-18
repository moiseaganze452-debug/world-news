import type { EmailProvider } from "@/lib/email/types";
import { ResendProvider } from "@/lib/email/providers/resend";
import { SmtpProvider } from "@/lib/email/providers/smtp";

/**
 * Point d'entrée unique pour tout le code applicatif.
 * Changer de fournisseur d'email se fait uniquement via EMAIL_PROVIDER
 * dans .env — aucun autre fichier n'a besoin d'être modifié.
 *
 * Usage :
 *   import { email } from "@/lib/email";
 *   await email.send({ to, subject, html });
 */
function createEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER ?? "resend";

  switch (provider) {
    case "smtp":
      return new SmtpProvider();
    case "resend":
    default:
      return new ResendProvider();
  }
}

export const email = createEmailProvider();
export type { EmailProvider, SendEmailInput } from "@/lib/email/types";
