/**
 * Templates HTML simples pour les emails transactionnels et la newsletter.
 * Volontairement minimalistes (tableaux HTML, styles inline) pour une bonne
 * compatibilité avec les clients mail — pas de dépendance à Tailwind ici.
 */

function baseLayout(siteName: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
      <p style="font-size: 18px; font-weight: 700; color: #0B1F3A; margin: 0 0 24px;">${siteName}</p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #6B7280;">
        Vous recevez cet email de la part de ${siteName}.
      </p>
    </div>
  `;
}

export function verificationEmailTemplate(params: { siteName: string; verifyUrl: string }): string {
  return baseLayout(
    params.siteName,
    `
      <p style="font-size: 14px; color: #111827;">Confirmez votre adresse email pour activer votre compte.</p>
      <a href="${params.verifyUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #0B1F3A; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
        Vérifier mon email
      </a>
    `
  );
}

export function passwordResetEmailTemplate(params: { siteName: string; resetUrl: string }): string {
  return baseLayout(
    params.siteName,
    `
      <p style="font-size: 14px; color: #111827;">
        Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
      </p>
      <a href="${params.resetUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #0B1F3A; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
        Réinitialiser mon mot de passe
      </a>
      <p style="margin-top: 16px; font-size: 12px; color: #6B7280;">Ce lien expire dans 1 heure.</p>
    `
  );
}

export function newsletterCampaignTemplate(params: { siteName: string; content: string }): string {
  return baseLayout(
    params.siteName,
    `<div style="font-size: 14px; color: #111827; line-height: 1.6;">${params.content}</div>`
  );
}
