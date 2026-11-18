import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Équivalent de `auth()` mais qui retourne explicitement `null` si le
 * token a été invalidé (sessionVersion divergente, compte désactivé —
 * voir callback session dans lib/auth/config.ts), plutôt qu'un objet
 * session avec un `user.id`/`user.role` vidés mais toujours présent.
 *
 * Le code existant du projet présume partout que "session non-null" ⟹
 * "session.user.id/role valides" (pattern `if (!session) redirect(...)`
 * répété dans la quasi-totalité des Server Actions). Ce wrapper préserve
 * cette garantie sans avoir à retoucher chaque appelant : utiliser cette
 * fonction plutôt que `auth()` directement dans tout nouveau code qui a
 * besoin de la protection sessionVersion.
 *
 * NON EXÉCUTÉ ICI : le code existant (créé avant §8/§71) appelle encore
 * `auth()` directement dans ses ~20 Server Actions. Elles restent
 * fonctionnellement correctes (un token invalidé y sera traité comme
 * "connecté mais avec un rôle vide", donc refusé par `can()`/
 * `requirePermission` faute de rôle reconnu) mais ne bénéficient pas
 * du message "session expirée" propre ni de la redirection immédiate.
 * Migrer ces appels vers ce wrapper est recommandé mais n'a pas été
 * fait automatiquement pour limiter le risque de régression sur du
 * code non testable dans cet environnement (pas de build possible).
 */
export async function getAuthenticatedSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return session;
}
