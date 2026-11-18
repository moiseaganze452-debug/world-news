/**
 * Politiques de rate limiting centralisées (§19, §42).
 *
 * Toutes les valeurs vivent ici plutôt que dispersées dans le code —
 * un changement de seuil se fait à un seul endroit, et le fichier sert
 * de référence unique pour l'audit de sécurité.
 *
 * fenêtre en millisecondes, limite = nombre de requêtes autorisées par
 * fenêtre et par clé (généralement IP, ou IP+email pour le login).
 */
export interface RateLimitPolicy {
  windowMs: number;
  limit: number;
  /** Message renvoyé à l'utilisateur en cas de dépassement. */
  message: string;
}

export const RATE_LIMIT_POLICIES = {
  // Authentification — cible brute force / credential stuffing (§6, §19)
  login: {
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 10,
    message: "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
  },
  // Par compte ciblé, fenêtre plus large : ralentit le credential stuffing
  // distribué sur plusieurs IP contre un même compte.
  loginPerAccount: {
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: "Trop de tentatives sur ce compte. Réessayez plus tard.",
  },
  passwordResetRequest: {
    windowMs: 60 * 60 * 1000, // 1h
    limit: 5,
    message: "Trop de demandes de réinitialisation. Réessayez plus tard.",
  },
  passwordResetSubmit: {
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: "Trop de tentatives. Réessayez plus tard.",
  },
  mfaVerify: {
    windowMs: 15 * 60 * 1000,
    limit: 8,
    message: "Trop de tentatives de vérification. Réessayez plus tard.",
  },

  // Contenu public généré par des visiteurs anonymes — spam/flooding (§52)
  commentSubmit: {
    windowMs: 10 * 60 * 1000,
    limit: 5,
    message: "Trop de commentaires envoyés. Merci de patienter avant d'en poster un autre.",
  },
  newsletterSubscribe: {
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: "Trop de tentatives d'inscription. Réessayez plus tard.",
  },

  // Recherche — coûteuse en base, cible facile de DoS applicatif (§51)
  search: {
    windowMs: 60 * 1000,
    limit: 20,
    message: "Trop de recherches. Merci de patienter.",
  },

  // Tracking publicitaire — anti-fraude sur les stats (§DoS/ressources)
  adTracking: {
    windowMs: 60 * 1000,
    limit: 30,
    message: "Trop de requêtes.",
  },

  // Uploads — coûteux (stockage, bande passante) (§21)
  mediaUpload: {
    windowMs: 60 * 1000,
    limit: 10,
    message: "Trop d'envois de fichiers. Merci de patienter.",
  },

  // API/Server Actions admin sensibles — au-delà de l'auth déjà requise
  adminSensitiveAction: {
    windowMs: 60 * 1000,
    limit: 30,
    message: "Trop de requêtes. Merci de patienter.",
  },

  // Filet de sécurité générique pour toute API publique non listée ci-dessus
  publicApiDefault: {
    windowMs: 60 * 1000,
    limit: 60,
    message: "Trop de requêtes.",
  },
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES;
