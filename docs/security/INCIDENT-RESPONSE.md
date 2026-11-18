# INCIDENT-RESPONSE.md — World News

Procédure générale : Détection → Confinement → Éradication → Récupération →
Post-mortem.

## Compte administrateur compromis

1. Désactiver le compte (`User.status` → `INACTIF` via `updateUserAction`
   ou directement en base si l'accès admin est lui-même compromis).
2. Incrémenter `User.sessionVersion` pour ce compte — invalide immédiatement
   toute session JWT active, même non expirée (voir `lib/auth/config.ts`).
3. Forcer un changement de mot de passe (le flux `resetPasswordAction`
   incrémente déjà `sessionVersion` automatiquement).
4. Si MFA était en place (non implémenté dans la version actuelle du
   projet — voir SECURITY-AUDIT.md §5), révoquer les facteurs enregistrés.
5. Consulter la table `AuditLog` pour identifier les actions effectuées
   par ce compte depuis la compromission suspectée.
6. Vérifier en particulier : changements de rôle, modifications de
   publicités (`scriptCode`/`htmlCode`), modifications de pages, exports
   de données.
7. Restaurer tout contenu altéré identifié à l'étape précédente.
8. Notifier les responsables du projet.

## Fuite de clé API / secret

1. Roter le secret immédiatement chez le fournisseur concerné.
2. Mettre à jour la variable d'environnement en production.
3. Vérifier les logs du fournisseur pour un usage anormal pendant la
   fenêtre d'exposition.
4. Vérifier que le secret n'a pas été commité dans l'historique Git
   (`git log -p | grep <fragment>` sur un miroir local, jamais sur un
   dépôt public).

## Fichier malveillant uploadé

1. Identifier l'entrée dans la table `Media` (auteur, date, IP via
   `AuditLog` si l'événement `file_uploaded` a été journalisé).
2. Supprimer le fichier via `deleteMedia` (supprime aussi côté storage
   provider).
3. Vérifier si la validation magic-bytes (`services/media-service.ts`) a
   été contournée ou si le fichier date d'avant sa mise en place — cela
   indique une régression à traiter en priorité.
4. Vérifier le compte ayant uploadé (`uploadedById`) pour signes de
   compromission plus large.

## XSS exploité en production

1. Identifier le champ vecteur (probablement `Advertisement.scriptCode`/
   `htmlCode` ou `Page.content` — voir SECURITY-AUDIT.md V-01/V-02).
2. Désactiver ou vider immédiatement le contenu concerné en base.
3. Vérifier la table `AuditLog` pour identifier qui a créé/modifié ce
   contenu et quand.
4. Si un compte a été utilisé pour l'injection, suivre la procédure
   "compte compromis" ci-dessus.
5. Auditer si la sanitization a été contournée par un chemin non couvert
   par `lib/security/sanitize.ts` — traiter comme une régression prioritaire.

## Compromission de la base de données

Hors périmètre applicatif de ce document — dépend de l'infrastructure
d'hébergement réelle. Voir SECURITY-ARCHITECTURE.md pour les recommandations
d'isolation réseau, et BACKUP-RECOVERY.md pour la procédure de restauration.
