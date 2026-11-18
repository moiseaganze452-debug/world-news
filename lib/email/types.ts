/**
 * Contrat commun à tous les fournisseurs d'envoi d'email.
 * Permet de changer de fournisseur (Resend / SMTP) sans modifier le reste
 * de l'application — seul lib/email/index.ts change. Même philosophie que
 * lib/storage/ pour les médias.
 */
export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<{ success: boolean; messageId?: string }>;
}
