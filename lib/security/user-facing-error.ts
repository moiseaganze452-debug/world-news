/**
 * Erreur explicitement destinée à être affichée telle quelle à
 * l'utilisateur (validation métier, refus volontaire). Toute autre
 * exception (erreur Prisma, erreur réseau, erreur de stockage, etc.)
 * doit être traitée comme interne (§43 — ne jamais exposer stack trace,
 * requête SQL, chemin filesystem ou variable d'environnement en
 * production) : logger le détail côté serveur, renvoyer un message
 * générique côté client.
 *
 * Usage : `throw new UserFacingError("Fichier trop volumineux.")`
 * dans une couche service, puis dans la Server Action/route appelante :
 *
 * ```ts
 * catch (error) {
 *   if (error instanceof UserFacingError) return { error: error.message };
 *   console.error(error); // détail complet côté serveur uniquement
 *   return { error: "Une erreur est survenue. Veuillez réessayer." };
 * }
 * ```
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}
