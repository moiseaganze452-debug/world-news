# Politique de sécurité — World News

## Signaler une vulnérabilité

Si vous découvrez une faille de sécurité dans ce projet, merci de la
signaler directement à l'équipe responsable plutôt que de l'exposer
publiquement (issue GitHub publique, réseaux sociaux, etc.).

*(À compléter avec une adresse de contact réelle avant mise en production —
non déterminée dans le cadre de cet audit.)*

## Documentation de sécurité du projet

- `docs/security/SECURITY-AUDIT.md` — rapport d'audit et vulnérabilités
  corrigées
- `docs/security/THREAT-MODEL.md` — modèle de menace
- `docs/security/SECURITY-ARCHITECTURE.md` — architecture et recommandations
  de déploiement
- `docs/security/SECURITY-TESTING.md` — ce qui a été testé et ce qui reste
  à valider
- `docs/security/INCIDENT-RESPONSE.md` — procédures de réponse à incident
- `docs/security/BACKUP-RECOVERY.md` — stratégie de sauvegarde

## Principe

Ce projet suit une approche de sécurité multicouche (défense en profondeur) :
validation côté serveur systématique, RBAC deny-by-default, sanitization du
contenu riche, rate limiting, journalisation des événements sensibles.

Aucune affirmation n'est faite selon laquelle le projet serait invulnérable.
L'objectif est l'absence de vulnérabilité critique connue après les
contrôles effectués, documentés dans `docs/security/SECURITY-AUDIT.md`.
