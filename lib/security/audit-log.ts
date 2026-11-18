import { prisma } from "@/lib/db/prisma";

/**
 * Journalisation structurée des événements de sécurité (§36).
 *
 * RÈGLE ABSOLUE : ne jamais passer de mot de passe, token de session
 * complet, JWT complet, clé API ou secret dans `metadata`. Cette fonction
 * ne filtre pas le contenu qu'on lui donne — c'est à l'appelant de ne
 * jamais y mettre de donnée sensible en clair. Voir §36 pour la liste
 * des événements attendus.
 */
export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_failed"
  | "permission_denied"
  | "admin_action"
  | "role_changed"
  | "file_uploaded"
  | "file_upload_rejected"
  | "suspicious_request"
  | "rate_limit_triggered"
  | "session_revoked";

export interface SecurityEventInput {
  type: SecurityEventType;
  userId?: string;
  resource?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export async function logSecurityEvent(input: SecurityEventInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.type,
        userId: input.userId,
        resource: input.resource,
        ipAddress: input.ipAddress,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      },
    });
  } catch {
    // La journalisation ne doit jamais faire échouer l'opération métier
    // qu'elle accompagne. Un échec d'écriture du log est silencieux ici
    // par conception ; en production, brancher un fallback (ex: Sentry,
    // stdout structuré capté par le collecteur de logs de l'infra) —
    // voir §38 Monitoring, NON CÂBLÉ par défaut dans ce projet.
    console.error(`[security] échec journalisation événement "${input.type}"`);
  }
}
