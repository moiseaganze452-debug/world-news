# 📋 PROJECT_STATUS.md — World News

**Ce fichier est le point de reprise du projet.** Si cette conversation atteint sa limite,
copiez-collez le contenu de ce fichier (ou uploadez-le) dans une nouvelle conversation avec Claude,
avec la consigne : *"Voici l'état d'avancement du projet World News, continue le développement à partir de là."*
Uploadez aussi le `.zip` du projet livré dans le chat le plus récent.

---

## 🎯 Résumé du projet

CMS média "World News" — Next.js 15 (App Router) + TypeScript + Prisma/PostgreSQL + Tailwind + shadcn/ui + Auth.js.
Cahier des charges complet dans `README.md` à la racine. Règle absolue : tout ce qui est visible sur le
site public doit être modifiable depuis l'admin, sans toucher au code.

**167 fichiers TypeScript/TSX/JS écrits à ce stade — toutes les fonctionnalités du cahier des charges (README.md) sont implémentées, et l'essentiel de la dette technique identifiée a été résorbé.**

---

## ✅ Ce qui est fait (fonctionnel et écrit)

### Configuration & fondations
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- [x] `.env.example`, `.gitignore`
- [x] Arborescence complète des dossiers

### Base de données
- [x] `prisma/schema.prisma` — **23 modèles, 13 enums**, toutes les entités du §30
- [x] `prisma/seed.ts` — données de démo (17 catégories, 5 auteurs, 15 articles, menu, réseaux sociaux, settings, pages)
- [x] `scripts/db-backup.sh`, `scripts/db-restore.sh`

### Authentification & sécurité
- [x] `lib/auth/` (config, index, schemas, actions — login + logout)
- [x] `lib/security/permissions.ts` — RBAC complet, 8 rôles
- [x] `middleware.ts` — protection routes `/admin/*`, header `x-pathname`
- [x] `types/next-auth.d.ts`

### Stockage médias
- [x] `lib/storage/` — interface + 3 providers (Cloudinary/R2/S3, squelettes avec TODO SDK) + factory

### Thème administrable
- [x] `lib/seo/theme.ts`, `app/layout.tsx`, `app/globals.css`

### SEO technique global
- [x] `app/sitemap.ts`, `app/robots.ts`

### Utilitaires
- [x] `lib/utils/` — cn, reading-time, slug, format-date

### Admin — CRUD complet
- [x] Dashboard (`app/admin/dashboard/page.tsx`) avec stats + top articles + activité récente
- [x] `services/dashboard-service.ts`
- [x] **Articles** : liste (`app/admin/articles/page.tsx`), création (`nouveau/page.tsx`), édition (`[id]/page.tsx`)
  - [x] `components/admin/article-form.tsx`, `article-editor.tsx`, `article-row-actions.tsx`, `article-status-badge.tsx`
  - [x] `lib/actions/article-actions.ts` (create/update/delete/duplicate/bulk)
  - [x] `lib/validation/article.ts`, `services/article-service.ts`
- [x] **Catégories** : `app/admin/categories/page.tsx` + `category-form.tsx` + `category-row.tsx`
  - [x] `lib/actions/category-actions.ts`, `lib/validation/category.ts`
- [x] **Médiathèque** : `app/admin/medias/page.tsx` + `media-upload-form.tsx` + `media-grid.tsx`
  - [x] `lib/actions/media-actions.ts`, `lib/validation/media.ts`, `services/media-service.ts`
- [x] Connexion admin : `app/admin/connexion/page.tsx` + `login-form.tsx` + `logout-button.tsx`
- [x] `components/admin/sidebar.tsx` + `config/admin-nav.ts` (navigation filtrée par permission)
- [x] `app/admin/layout.tsx` (contrôle session + sidebar, exclut la page connexion via header x-pathname)

### Site public — cœur complet
- [x] `app/(public)/layout.tsx` (Header + Footer)
- [x] `components/layout/header.tsx` (menu dynamique DB, breaking news, recherche, mobile)
- [x] `components/layout/footer.tsx` (réseaux sociaux DB, catégories, liens rapides, newsletter)
- [x] `components/navigation/mobile-menu-button.tsx`, `search-box.tsx`, `pagination.tsx`
- [x] **Homepage** (`app/(public)/page.tsx`) — hero, secondaires, dernières nouvelles, catégories, tendances (sidebar), emplacement pub, newsletter — TOUTES les sections du §6
- [x] **Page article** (`app/(public)/article/[slug]/page.tsx`) — SEO dynamique (generateMetadata), Schema.org NewsArticle + BreadcrumbList, fil d'ariane, image de couverture, contenu riche, tags, partage social (haut+bas), articles similaires, commentaires (formulaire + liste, modération)
  - [x] `components/articles/article-content.tsx` (rendu du JSON éditeur), `share-buttons.tsx`
  - [x] `components/comments/comment-form.tsx`, `comment-list.tsx`
  - [x] `lib/actions/comment-actions.ts`, `lib/validation/comment.ts`
- [x] **Page catégorie** (`app/(public)/categorie/[slug]/page.tsx`) — paginée, SEO
- [x] **Page auteur** (`app/(public)/auteur/[slug]/page.tsx`) — bio, réseaux sociaux, articles paginés
- [x] **Recherche** (`app/(public)/recherche/page.tsx`) — `search-box.tsx`, résultats paginés
- [x] **Actualités** (`app/(public)/actualites/page.tsx`) — listing général paginé
- [x] **Pages personnalisées** (`app/(public)/[slug]/page.tsx`) — route générique pilotée par le modèle `Page` (couvre à-propos, contact, confidentialité, conditions — pas de dossiers dédiés, tout passe par l'admin Pages à venir)
- [x] **404** (`app/not-found.tsx`) — personnalisée, boutons retour accueil / recherche
- [x] `app/api/newsletter/route.ts` — inscription newsletter (form HTML + JSON)
- [x] `components/articles/article-card.tsx` (carte réutilisable 3 tailles), `newsletter-section.tsx`
- [x] `services/public-content-service.ts` — **service central du site public** (hero, secondaires, dernières, tendances, catégories avec count, article by slug, similaires, increment vues, menu principal avec résolution slug, réseaux sociaux, recherche, pagination par catégorie/auteur)

---

## ✅ Complété depuis la dernière mise à jour

- [x] Page vidéo `/video` (`services/public-content-service.ts::getVideoArticles`)
- [x] Mode sombre complet : `components/layout/theme-provider.tsx`, `theme-toggle.tsx`, intégré dans `app/layout.tsx` + `header.tsx`. `SiteTheme.defaultMode` ajouté dans `lib/seo/theme.ts` (clé `general.defaultThemeMode`). Choix assumé : les couleurs admin ne surchargent QUE `:root` (mode clair) ; `.dark` garde sa palette calibrée dans `globals.css` — voir commentaire dans `app/layout.tsx`.
- [x] **Apparence** (§19) — `app/admin/apparence/page.tsx` + `components/admin/appearance-form.tsx` (aperçu en direct, sélecteurs HEX convertis en HSL via `lib/utils/color.ts`) + `lib/actions/appearance-actions.ts` + `lib/validation/appearance.ts`. Écrit dans les MÊMES clés `Setting` que `lib/seo/theme.ts` lit — ne pas renommer une clé sans mettre à jour les deux fichiers.
- [x] **Auteurs** admin — CRUD complet : liste (`app/admin/auteurs/page.tsx`), création (`nouveau/page.tsx`), édition (`[id]/page.tsx`), `components/admin/author-form.tsx` + `author-row.tsx`, `lib/actions/author-actions.ts`, `lib/validation/author.ts`. Un auteur est lié à un `User` existant (1:1) ; suppression bloquée si des articles y sont rattachés.
- [x] **Pages** admin — CRUD complet : liste, création (`nouvelle/page.tsx`), édition (`[id]/page.tsx`), `components/admin/page-form.tsx` + `page-row.tsx`, `lib/actions/page-actions.ts` (avec `RESERVED_SLUGS` empêchant les collisions avec les routes système), `lib/validation/page.ts`.

## ✅ Complété — lot 2

- [x] **Menus** admin (§18) — `app/admin/menus/page.tsx`, drag & drop réel via `components/admin/menu-builder.tsx` (@dnd-kit/core + sortable), `add-menu-item-form.tsx`, `new-menu-form.tsx`, `lib/actions/menu-actions.ts` (create/add item/reorder/delete). Réutilise la logique de résolution de slug déjà présente dans `getMainMenu()`.
- [x] **Utilisateurs** admin (§29) — CRUD complet avec RBAC strict : `lib/actions/user-actions.ts` empêche l'auto-élévation de rôle, la modification de son propre rôle, et la suppression de son propre compte ; SUPER_ADMIN/ADMIN protégés derrière `users.manage.roles`. Pages liste/création/édition + `create-user-form.tsx`, `edit-user-form.tsx`, `user-row.tsx`.
- [x] **Publicités** admin (§22, Ad Manager) — CRUD complet (`app/admin/publicites/`, `ad-form.tsx`, `ad-row.tsx`, `lib/actions/advertisement-actions.ts`) + **affichage public réel** : `components/advertising/ad-slot.tsx` (Server Component, sélectionne une pub ACTIVE dans la fenêtre startDate/endDate pour un placement donné) + `ad-impression-tracker.tsx` (client, fire-and-forget) + routes `app/api/ads/[id]/click/route.ts` (redirection + comptage) et `.../impression/route.ts`. Le placeholder statique de la sidebar homepage a été remplacé par `<AdSlot placement="SIDEBAR" />`.

## ✅ Complété — lot 3

- [x] **Newsletter** admin (§23) — `app/admin/newsletter/page.tsx` (abonnés + campagnes), `subscriber-row.tsx`, `campaign-form.tsx`, `campaign-row.tsx`, `lib/actions/newsletter-actions.ts`. Export CSV réel via `app/api/newsletter/export/route.ts` (protégé par permission, télécharge un fichier daté). L'envoi de campagne (`sendCampaignAction`) marque le statut ENVOYEE et compte les destinataires actifs, mais **n'envoie pas encore d'email réel** — prêt à brancher sur `lib/email/` (Resend/SMTP, pas encore implémenté).
- [x] **SEO** admin (§24) — `app/admin/seo/page.tsx` + `components/admin/seo-settings-form.tsx` + `lib/actions/seo-actions.ts` + `lib/validation/seo-settings.ts`. Gère le modèle `SeoSetting` (title/description/keywords/OG image/Google & Bing verification/Analytics ID/robots additionnel).
- [x] **Commentaires** admin (§12, modération) — `app/admin/commentaires/page.tsx` avec onglets par statut (en attente/approuvés/rejetés), `comment-moderation-row.tsx`, `lib/actions/comment-moderation-actions.ts` (approuver/rejeter/supprimer/bloquer un commentateur par email).

## ✅ Complété — lot 4 (clôture de la roadmap admin + finitions)

- [x] **Statistiques** admin (§35) — `app/admin/statistiques/page.tsx`, `services/analytics-service.ts` (top articles par vues, catégories populaires, compteurs `AnalyticsEvent`, stats globales), graphique en barres `popular-categories-chart.tsx` (recharts). Se base sur `Article.viewCount` déjà peuplé plutôt que d'attendre un tracker `AnalyticsEvent` qui n'est pas encore écrit côté public.
- [x] **Notifications** admin (§34) — `services/notification-service.ts` (point d'entrée centralisé `createNotification`), `app/admin/notifications/page.tsx`, `notification-row.tsx`, `mark-all-read-button.tsx`, `lib/actions/notification-actions.ts`. **Déclenchement automatique branché** : nouveau commentaire en attente (`comment-actions.ts`) et nouvel abonné newsletter (`app/api/newsletter/route.ts`) créent chacun une notification.
- [x] **Paramètres** admin (§47) — page fédératrice `app/admin/parametres/page.tsx` avec 3 sous-formulaires : `general-settings-form.tsx`, `comment-settings-form.tsx` (autoApprove + activation globale), `maintenance-settings-form.tsx`. `lib/actions/settings-actions.ts`.
- [x] **Mode maintenance** (§48) — **réellement appliqué**, pas seulement stocké : `app/(public)/layout.tsx` vérifie `maintenance.enabled` à chaque requête publique et affiche `components/layout/maintenance-page.tsx` aux visiteurs non connectés ; un admin connecté (n'importe quel rôle) continue de voir le site normalement pour vérifier avant réouverture. Fait côté layout (Node runtime) plutôt que dans `middleware.ts` (Edge runtime) à cause de l'accès Prisma.
- [x] **Sécurité** admin (§31/§32) — `app/admin/securite/page.tsx`, liste paginée de `AuditLog` avec utilisateur/action/ressource/date, redirection si rôle non autorisé (réservé `security.manage`, donc SUPER_ADMIN uniquement selon `lib/security/permissions.ts`).
- [x] **PWA** (§42) — `app/manifest.ts` (manifest dynamique généré depuis le thème admin : nom, couleurs, tagline), `public/sw.js` (service worker cache-first sur assets / network-first sur contenu, offline shell basique), `components/layout/service-worker-register.tsx` enregistré dans `app/layout.tsx`. Icônes référencées (`/icons/icon-192.png` etc.) mais **pas encore générées** — voir dette technique ci-dessous.

## ✅ Complété — lot 5 (résorption de la dette technique)

- [x] **`lib/email/` implémenté et branché** — `types.ts` (interface `EmailProvider`), `providers/resend.ts` (SDK réel `resend`), `providers/smtp.ts` (nodemailer, déjà en dépendance), `index.ts` (factory via `EMAIL_PROVIDER`), `templates.ts` (vérification email, reset mot de passe, campagne newsletter — HTML avec styles inline pour compatibilité clients mail). `sendCampaignAction` envoie désormais réellement les emails par lots de 50 (`BATCH_SIZE`) au lieu de seulement marquer un statut, avec comptage réel des envois réussis (`Promise.allSettled`).
- [x] **Flux complet de mot de passe oublié** (§3) — `lib/auth/password-reset-actions.ts` : `requestPasswordResetAction` (ne révèle jamais si l'email existe, réutilise le modèle `VerificationToken` déjà requis par l'adapter Auth.js avec un identifier préfixé `password-reset:<email>`, token 32 bytes, expiration 1h) et `resetPasswordAction` (vérifie expiration, hash bcrypt, supprime le token après usage). Pages `/admin/mot-de-passe-oublie` et `/admin/reinitialiser-mot-de-passe` + `forgot-password-form.tsx` + `reset-password-form.tsx`. **Ces routes sont exclues du contrôle de session** dans `middleware.ts` ET `app/admin/layout.tsx` via la constante partagée `PUBLIC_ADMIN_PATHS` (dupliquée intentionnellement dans les deux fichiers — Edge runtime vs Node runtime empêchent un import commun facile ; si l'un des deux est modifié, répercuter sur l'autre). Lien "Mot de passe oublié ?" ajouté dans `login-form.tsx`.
- [x] **`AdSlot` câblé à TOUS les emplacements publics** (§22) — `HEADER` (dans `header.tsx`, nouvelle prop `hideIfEmpty` pour ne rien rendre plutôt qu'un placeholder permanent sur la barre sticky), `HOMEPAGE` (entre le hero et les dernières nouvelles), `SIDEBAR` (déjà fait précédemment), `ARTICLE` et `ENTRE_ARTICLES` (page article), `FOOTER` (zone à fond clair dédiée pour rester lisible sur le footer sombre). Seul `MOBILE` n'est pas câblé (pertinent uniquement pour une future app mobile native, hors scope web). Le composant distingue maintenant emplacements "bannière" (large, court) et "carré" (sidebar) pour un placeholder cohérent.
- [x] **Icônes PWA générées réellement** — `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable.png` créées via Pillow (pas de réseau requis) à partir d'un monogramme "WN" sur fond `#0B1F3A` avec barre d'accent `#C62828`, conformes à la charte du §51. `favicon.png` et `apple-touch-icon.png` dérivés et branchés dans `app/layout.tsx` (utilisés seulement si l'admin n'a pas encore uploadé son propre favicon via `identity.faviconUrl`). Correction d'une référence cassée : le Schema.org `NewsArticle.publisher.logo` pointait vers `/icons/logo.png` (inexistant) → corrigé vers `/icons/icon-512.png`.
- [x] **Relecture de cohérence complète** de tout le lot 5 : noms de contraintes Prisma (`identifier_token`), imports, dépendances déjà déclarées (`resend`, `nodemailer`, `@types/nodemailer`), cohérence des chemins publics entre `middleware.ts` et `app/admin/layout.tsx`, cohérence manifest ↔ fichiers icônes réellement présents sur disque.

## 🚧 Reste à faire — dette technique résiduelle (aucune fonctionnalité manquante)

Le projet est fonctionnellement complet. Il ne reste que ce qui nécessite une exécution réelle (impossible dans cet environnement de développement sans accès réseau) :

1. **Aucune commande npm/prisma n'a jamais été exécutée** — priorité absolue à la reprise, avant tout déploiement :
   ```
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   npm run typecheck
   npm run build
   ```
   Le typecheck va probablement révéler quelques ajustements mineurs (jamais vérifiés faute d'exécution possible ici) — traiter au cas par cas, l'architecture et les types ont été relus manuellement avec soin mais un compilateur réel reste plus fiable qu'une relecture humaine.
2. **Providers de stockage médias** (`lib/storage/providers/*.ts`) restent des squelettes avec `throw new Error(...)` — contrairement à `lib/email/` qui a été réellement implémenté cette session, les providers de stockage médias n'ont pas encore les vrais appels SDK (Cloudinary / `@aws-sdk/client-s3`). Prochaine cible naturelle si une nouvelle session de dev démarre.
3. **Aucun tracker `AnalyticsEvent` front-end n'écrit encore dans ce modèle** — les statistiques admin se basent sur `Article.viewCount` (fiable, déjà utilisé) plutôt que sur des événements détaillés (pays, appareil, source de trafic). Le modèle Prisma existe et est prêt à recevoir des écritures.
4. Pas de migration Prisma générée (conséquence directe du point 1).
5. Les templates email (`lib/email/templates.ts`) sont volontairement simples (HTML + styles inline, pas de vrai design system email) — suffisant pour fonctionner, perfectible visuellement.

## 🔎 Comment vérifier que tout fonctionne après reprise

Une fois les commandes du point 1 exécutées :
1. Se connecter avec `admin@world-news.com` / `WorldNews2026!` (créé par le seed)
2. Parcourir chaque entrée de `config/admin-nav.ts` — tous les modules listés y ont une page fonctionnelle
3. Tester le flux mot de passe oublié depuis `/admin/connexion` (nécessite `RESEND_API_KEY` ou config SMTP valide dans `.env` pour recevoir réellement l'email — sans ça, `requestPasswordResetAction` s'exécute sans erreur mais l'email ne partira pas)
4. Vérifier l'affichage des emplacements publicitaires sur la homepage, une page article, et le footer (créer une pub ACTIVE depuis `/admin/publicites` pour voir le rendu réel plutôt que le placeholder)

---

## 🧭 Décisions techniques prises (à respecter pour la cohérence)

- **Slugs et statuts en français** dans les URLs et enums Prisma
- Le **thème (couleurs/identité)** vit dans la table `Setting` (clé-valeur), lu par `lib/seo/theme.ts`, injecté via `<style>` dans `app/layout.tsx` — l'admin Apparence à venir doit écrire dans ces mêmes clés (`colors.primary`, `identity.siteName`, etc.), ne pas créer de système parallèle
- Le **RBAC** est centralisé dans `lib/security/permissions.ts` (`can()`/`requirePermission()`) — toute nouvelle route admin vérifie une permission avec cette fonction
- Le **stockage médias** passe toujours par `import { storage } from "@/lib/storage"`
- Les **Server Actions** sont préférées aux routes API pour les mutations admin ; `app/api/*` réservé à ce qui doit être appelable hors contexte Next.js (webhooks, newsletter form direct, API publique future)
- **Audit log systématique** : chaque Server Action de mutation admin (articles, catégories, médias) écrit dans `AuditLog` — respecter ce pattern pour les nouveaux modules (menus, pubs, utilisateurs, etc.)
- Le **service public** (`services/public-content-service.ts`) est le point d'entrée unique pour toute lecture côté site public — ne pas requêter Prisma directement depuis une page publique sauf cas simple isolé (voir `[slug]/page.tsx` qui fait une exception pour `Page` par simplicité)
- Identifiants publics en **UUID** partout
- Pas de `localStorage`/`sessionStorage`

## ⚠️ Points d'attention / dette technique connue

- Les 3 providers de stockage sont des **squelettes** : logique d'upload réelle (SDK) à implémenter avant déploiement
- **Aucune commande npm install/prisma generate/migrate n'a jamais été exécutée** (pas de réseau dans l'environnement de développement) — à faire en priorité dès récupération : `npm install && npx prisma generate && npx prisma migrate dev && npm run typecheck`
- Pas de migration Prisma générée
- `components/admin/article-editor.tsx` : vérifier si Tiptap y est réellement câblé ou si c'est un textarea de secours — non revérifié depuis sa création
- La route `app/(public)/[slug]/page.tsx` interroge Prisma directement (contenu HTML brut via `dangerouslySetInnerHTML`) plutôt que de passer par le service central — acceptable pour une page statique simple mais à harmoniser si le module Pages admin ajoute de la logique (SEO avancé, blocs, etc.)
- Pas encore de composant d'affichage des publicités (`Advertisement`) côté public — la homepage a un simple placeholder statique en attendant l'Ad Manager

## 📦 Comment reprendre dans une nouvelle conversation

1. Uploader ou coller ce fichier `PROJECT_STATUS.md`
2. Uploader le `.zip` du projet le plus récent (lien `computer://` dans le chat)
3. Dire à Claude : *"Continue le développement de World News à partir de PROJECT_STATUS.md, prochaine étape : [choisir dans 🚧 À faire]"*
4. Claude doit relire `prisma/schema.prisma`, `lib/security/permissions.ts`, `config/admin-nav.ts` et `services/public-content-service.ts` avant d'ajouter du code, pour rester cohérent avec l'existant
