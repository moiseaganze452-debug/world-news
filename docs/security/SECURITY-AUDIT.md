# SECURITY-AUDIT.md — World News

**Date de l'audit :** 21 août 2026
**Méthode :** revue manuelle du code source (pas d'exécution de `npm audit`,
`next build`, SAST ou DAST — voir limitations en fin de document).
**Portée :** authentification, autorisation/RBAC, Server Actions, routes API,
uploads, validation, XSS, IDOR, rate limiting, secrets, headers/CSP,
pagination, gestion d'erreurs.

---

## 1. Résumé

| Sévérité | Trouvées | Corrigées | Documentées sans correctif code |
|----------|----------|-----------|----------------------------------|
| CRITICAL | 3        | 3         | 0                                 |
| HIGH     | 6        | 6         | 0                                 |
| MEDIUM   | 7        | 7         | 0                                 |
| LOW/INFO | 4        | 2         | 2                                 |

Aucune vulnérabilité CRITICAL connue ne subsiste dans le code audité après
correction. Ceci **ne constitue pas** une garantie d'invulnérabilité — voir
§7 Limitations.

---

## 2. Tableau des vulnérabilités

| ID | Vulnérabilité | Sévérité | Fichier(s) | Impact | Cause | Correction | Statut |
|----|----------------|----------|------------|--------|-------|------------|--------|
| V-01 | XSS stocké : `Advertisement.scriptCode`/`htmlCode` exécuté sans sanitization sur toutes les pages publiques | CRITICAL | `components/advertising/ad-slot.tsx`, `lib/actions/advertisement-actions.ts` | Un compte AD_MANAGER compromis (ou une erreur) exécute du JS arbitraire sur tout le trafic public | `dangerouslySetInnerHTML` sur contenu utilisateur non filtré | Sanitizer DOMPurify dédié (`lib/security/sanitize.ts`), rendu de `scriptCode` retiré du composant public, permission séparée `ads.manage.scripts` réservée SUPER_ADMIN | Corrigé |
| V-02 | XSS stocké : `Page.content` rendu sans sanitization | CRITICAL | `lib/actions/page-actions.ts`, `app/(public)/[slug]/page.tsx` | Stored XSS via une page éditée par un compte EDITOR+ compromis | Aucune sanitization à l'écriture | `sanitizeArticleHtml()` appliqué en création et mise à jour | Corrigé |
| V-03 | Upload : validation MIME basée uniquement sur le Content-Type déclaré par le navigateur | CRITICAL | `services/media-service.ts` | Un fichier malveillant renommé avec une extension/MIME trompeur peut être accepté | Absence de vérification de signature binaire | Vérification magic-bytes via `file-type`, rejet si divergence, nom de fichier serveur aléatoire | Corrigé (non testé en conditions réelles) |
| V-04 | Absence totale de rate limiting (login, reset password, commentaires, recherche, newsletter, uploads, tracking pub) | HIGH | Transversal | Brute force, credential stuffing, spam, DoS applicatif | Aucun mécanisme existant | Module centralisé `lib/security/rate-limit.ts` + `rate-limit-policies.ts`, câblé sur tous les points d'entrée listés | Corrigé (implémentation mémoire — voir limitation multi-instance) |
| V-05 | IDOR sur soumission de commentaire : articleId/parentId non vérifiés contre articleSlug | HIGH | `lib/actions/comment-actions.ts` | Un commentaire peut être attaché à un article arbitraire ou usurper un fil de réponse | Absence de contrôle métier au-delà du format (UUID) | Vérification explicite que articleId correspond à articleSlug et que parentId appartient au même article | Corrigé |
| V-06 | Export newsletter (PII) potentiellement accessible avec une session révoquée | HIGH | `app/api/newsletter/export/route.ts` | Un compte désactivé après compromission (mot de passe changé) garde l'accès à l'export d'abonnés | Route hors du matcher middleware (/api/* non couvert) + check `if (!session)` insuffisant après ajout de sessionVersion | Check corrigé en `!session?.user?.id`, + rate limiting, plafond de volume, journalisation, Cache-Control: private, no-store | Corrigé |
| V-07 | Pas d'invalidation de session après changement de mot de passe | HIGH | `lib/auth/config.ts`, `lib/auth/password-reset-actions.ts`, `prisma/schema.prisma` | Une session établie avant un reset de mot de passe reste valide après | Stratégie JWT stateless sans mécanisme de révocation | Champ User.sessionVersion, comparé à chaque requête dans le callback JWT, incrémenté au reset | Corrigé dans le code — migration Prisma non exécutée (pas de DB accessible ici) |
| V-08 | Permission ads.manage trop large : n'importe quel gestionnaire de pub peut injecter du JS arbitraire | HIGH | `lib/security/permissions.ts` | Escalade XSS via un rôle non-SUPER_ADMIN | Absence de séparation de privilège pour le code exécutable | Nouvelle permission ads.manage.scripts, non accordée à ADMIN/AD_MANAGER | Corrigé |
| V-09 | Pas de Content-Security-Policy | HIGH | `next.config.ts` | Pas de défense en profondeur contre XSS si une sanitization échoue ailleurs | CSP absente | CSP restrictive ajoutée (compromis unsafe-inline documenté dans le fichier) | Corrigé — non vérifié en conditions réelles |
| V-10 | recordAdClick/recordAdImpression : pas de gestion d'erreur, ID inexistant non géré | MEDIUM | `lib/actions/advertisement-actions.ts` | Exception Prisma non catchée sur un ID forgé/supprimé | Absence de try/catch | Try/catch ajouté (échec silencieux, non critique pour du tracking) + rate limiting anti-fraude de stats | Corrigé |
| V-11 | page/pageSize non bornés sur 6 fonctions de listing public | MEDIUM | `services/public-content-service.ts`, `services/media-service.ts` | pageSize=999999999 ou page=NaN propagés à une requête Prisma incontrôlée | Absence de clamp | Helper centralisé `lib/utils/pagination.ts`, appliqué partout | Corrigé |
| V-12 | page recherche publique non validé (NaN, négatif) | MEDIUM | `app/(public)/recherche/page.tsx` | parseInt peut produire NaN, propagé à skip | Absence de garde | Clamp explicite avant appel service | Corrigé |
| V-13 | Recherche publique sans longueur maximale de requête | MEDIUM | `services/public-content-service.ts` | Requête ILIKE coûteuse sur chaîne arbitrairement longue | Absence de limite | Troncature à 100 caractères | Corrigé |
| V-14 | Recherche publique sans rate limiting | MEDIUM | `app/(public)/recherche/page.tsx` | DoS applicatif par requêtes répétées | Absence de limite | Rate limiting ajouté (voir limitation sur le rendu de page en §7) | Corrigé |
| V-15 | Inscription newsletter sans rate limiting | MEDIUM | `app/api/newsletter/route.ts` | Création massive d'abonnés / spam de notifications admin | Absence de limite | Rate limiting ajouté | Corrigé |
| V-16 | Upload média sans rate limiting par utilisateur | MEDIUM | `lib/actions/media-actions.ts` | Un compte légitime compromis peut déverser un volume massif de fichiers | Absence de limite | Rate limiting par utilisateur ajouté | Corrigé |
| V-17 | error.message brut renvoyé au client sur échec d'upload | LOW | `lib/actions/media-actions.ts`, `services/media-service.ts` | Fuite potentielle de détail technique si une erreur non prévue survient | Absence de distinction erreur métier / erreur interne | Classe UserFacingError dédiée ; toute autre exception renvoie un message générique et journalise le détail côté serveur | Corrigé |
| V-18 | Absence d'error.tsx/global-error.tsx | LOW | `app/` | Défense en profondeur manquante en cas d'exception non catchée | Fichiers absents | `app/error.tsx` et `app/global-error.tsx` créés, message générique fixe | Corrigé |
| V-19 | Routes API sans try/catch explicite (hors newsletter/export) | INFO | `app/api/*/route.ts` | Risque théorique — Next.js gère déjà un 500 générique par défaut en production | Non systématique | Documenté, pas de changement de code | Documenté, non corrigé |
| V-20 | articleFilterSchema.search sans longueur maximale | INFO | `lib/validation/article.ts` | Requête admin authentifiée légèrement coûteuse sur chaîne longue | Absence de .max() | Non corrigé — risque faible (contexte admin authentifié, permission déjà requise) | Documenté, non corrigé |

---

## 3. Points audités et jugés sains (aucun correctif nécessaire)

- **SQL Injection** : aucune utilisation de `$queryRaw`/`$executeRaw` dans le
  projet ; tout passe par Prisma paramétré.
- **Password reset** : token aléatoire cryptographique, anti-énumération
  d'email, expiration 1h, suppression après usage, bcrypt cost 12. Déjà
  conforme aux bonnes pratiques avant l'audit.
- **Escalade de privilège utilisateurs** : `user-actions.ts` empêchait déjà
  l'auto-élévation de rôle, l'auto-modification du rôle, l'auto-suppression,
  et réservait la création de rôles ADMIN/SUPER_ADMIN à SUPER_ADMIN.
- **Rendu des articles** : le contenu (JSON Tiptap) est parsé en éléments
  React natifs, pas de dangerouslySetInnerHTML — échappement automatique
  par React, non vulnérable au XSS malgré une apparence similaire au cas V-02.
- **Secrets** : aucun secret hardcodé trouvé dans le dépôt ; .env.example
  ne contient aucune valeur réelle.
- **Pagination admin (listArticles)** : déjà bornée correctement via Zod
  avant l'audit.
- **Routes de tracking publicitaire (app/api/ads/*)** : délèguent proprement
  aux Server Actions déjà sécurisées.
- **Deuxième passe anti-bypass** : aucun TODO security, FIXME, bypass
  temporaire, console.log de debug, credential de test, ou
  @ts-ignore/eslint-disable suspect trouvé dans le code applicatif.

---

## 4. Ce qui reste explicitement NON VÉRIFIÉ

Cette section liste ce qui n'a pas pu être testé en conditions réelles dans
cet environnement (pas d'accès réseau pour npm install, pas de base de
données connectée, pas de build exécutable) :

- Compilation TypeScript complète (tsc --noEmit) — revue manuelle uniquement.
- npm audit / scan de dépendances — non exécuté.
- Build de production (next build) — non exécuté.
- Tests d'intégration de l'upload avec des fichiers réels malveillants.
- Comportement réel de la CSP dans un navigateur (compromis unsafe-inline
  documenté en attendant validation).
- Comportement du rate limiting en environnement multi-instance (implémentation
  en mémoire locale au process — voir lib/security/rate-limit.ts pour le
  point d'extension Redis/Upstash).
- DAST (OWASP ZAP ou équivalent) contre un environnement de staging réel.
- Scan SAST (Semgrep/CodeQL).

Aucun de ces éléments n'a été simulé ou déclaré "passé" par erreur — voir
SECURITY-TESTING.md pour le détail de ce qui est testable et comment.

---

## 5. Fonctionnalités absentes (constatées, pas des vulnérabilités de code)

- Pas de flux "changer mon mot de passe" pour un utilisateur déjà connecté.
- Pas de MFA/TOTP implémenté (champs présents dans le schéma, logique absente).
- Pas d'UI de gestion des sessions actives.
- Storage providers (Cloudinary/S3/R2) : stubs non implémentés (TODO déjà
  présents avant l'audit).
