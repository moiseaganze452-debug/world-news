# SECURITY-TESTING.md — World News

## Limitation de l'environnement d'audit

Cet audit a été réalisé sans accès réseau sortant et sans base de données
connectée. Concrètement : `npm install`, `npm audit`, `next build`,
`prisma migrate`, et tout test d'intégration réel étaient **impossibles à
exécuter**. Tout ce qui suit distingue explicitement ce qui a été vérifié
par lecture de code de ce qui nécessite une exécution réelle.

## Vérifié par revue de code (pas d'exécution)

| Élément | Méthode |
|---|---|
| Absence de SQL brut | `grep` exhaustif sur `$queryRaw`/`$executeRaw` |
| Absence de secrets hardcodés | `grep` par motifs (clés, mots de passe, tokens) sur tout le dépôt |
| RBAC deny-by-default | Lecture de `lib/security/permissions.ts` et de chaque Server Action |
| Cohérence des schémas Zod vs modèles Prisma | Lecture croisée fichier par fichier |
| Absence de bypass de développement | `grep` sur TODO/FIXME/bypass/mock/`@ts-ignore` |

## NON exécuté — à faire avant mise en production

- [ ] `npm install && npm audit` — état réel des dépendances tierces inconnu
- [ ] `npx tsc --noEmit` — compilation TypeScript complète non validée
- [ ] `next build` — build de production non validé
- [ ] `npx prisma migrate dev` — migration pour `User.sessionVersion` non générée
- [ ] Test manuel : upload d'un fichier renommé (ex. `.php` renommé `.png`)
      pour confirmer le rejet par la vérification magic-bytes
- [ ] Test manuel : soumission de commentaire avec un `articleId` d'un autre
      article pour confirmer le rejet IDOR
- [ ] Test manuel : brute force sur `/admin/connexion` pour confirmer le
      blocage après le seuil configuré
- [ ] Test manuel : chargement de la CSP dans un navigateur réel — vérifier
      qu'aucune fonctionnalité Next.js n'est cassée
- [ ] Scan DAST (OWASP ZAP) en environnement de staging
- [ ] Scan SAST (Semgrep ou CodeQL)

## Recommandation de suite de tests automatisés à écrire

Ce projet n'a pas de suite de tests de sécurité automatisée. Recommandation
de structure (à adapter à l'outil de test déjà utilisé par le projet, si
existant) :

- **Authentification** : brute force bloqué après N tentatives, login avec
  identifiants invalides, session révoquée après reset de mot de passe.
- **Autorisation** : chaque rôle testé contre chaque action réservée à un
  rôle supérieur (ex. AUTHOR tentant `users.manage`).
- **IDOR** : commentaire avec `articleId` étranger rejeté.
- **Upload** : fichier avec extension trompeuse rejeté, fichier trop
  volumineux rejeté, fichier vide rejeté.
- **Rate limiting** : Nème requête sur un endpoint limité renvoie l'erreur
  attendue.
