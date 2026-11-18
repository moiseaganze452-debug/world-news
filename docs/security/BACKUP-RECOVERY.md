# BACKUP-RECOVERY.md — World News

## État actuel

**NON VÉRIFIÉ / NON CONFIGURÉ DANS CE PROJET.** Ce document décrit la
stratégie recommandée ; sa mise en œuvre dépend de l'hébergeur PostgreSQL
et du fournisseur de stockage de fichiers réels choisis pour la production,
qui n'ont pas pu être déterminés ni configurés dans cet environnement
(pas d'accès réseau, providers de stockage encore à l'état de stub — voir
SECURITY-AUDIT.md §5).

## Recommandation

- **Base de données** : sauvegarde quotidienne automatique + rétention
  hebdomadaire/mensuelle selon la politique retenue, chiffrée au repos,
  stockée séparément de l'instance de production.
- **Fichiers médias** : redondance native du provider de stockage choisi
  (Cloudinary/S3/R2 offrent tous une durabilité élevée par défaut) ;
  vérifier la configuration de versioning/rétention côté fournisseur.
- **Test de restauration** : à planifier périodiquement. Un backup jamais
  testé ne doit pas être considéré comme fiable.

## RPO / RTO

À définir avec les responsables du projet selon la criticité réelle du
service. Non déterminé dans le cadre de cet audit — dépend de contraintes
business (fréquence de publication, tolérance à la perte de commentaires
récents, etc.) hors du périmètre technique de cette revue.

## Procédure de restauration (squelette)

1. Base de données : restaurer le dump le plus récent sur une instance
   PostgreSQL propre.
2. Exécuter les migrations Prisma manquantes si le schéma a évolué depuis
   le backup (`npx prisma migrate deploy`).
3. Vérifier l'intégrité des relations critiques (utilisateurs, articles
   publiés, permissions).
4. Fichiers médias : si le provider de stockage est indépendant de la
   base, vérifier que les références `Media.providerKey` en base
   correspondent toujours à des fichiers existants côté provider.
5. Redéployer l'application avec les variables d'environnement à jour.
6. Vérifier `User.sessionVersion` — envisager un incrément global après
   une restauration pour forcer une reconnexion de tous les utilisateurs,
   par précaution.
