# SECURITY-ARCHITECTURE.md — World News

## Ce qui est couvert par le code applicatif

- Authentification (Auth.js, bcrypt, sessionVersion pour révocation)
- RBAC deny-by-default (`lib/security/permissions.ts`)
- Sanitization du contenu riche (`lib/security/sanitize.ts`)
- Rate limiting applicatif (`lib/security/rate-limit.ts`)
- Journalisation de sécurité (`lib/security/audit-log.ts`, table AuditLog)
- Validation Zod centralisée par domaine (`lib/validation/*`)
- Headers de sécurité + CSP (`next.config.ts`)

## Ce qui doit être configuré au niveau infrastructure (non couvert ici)

Le code applicatif ne peut pas se substituer à une architecture réseau
correcte. Recommandations pour un déploiement production à grande échelle :

```
Internet
   |
CDN / WAF (ex: Cloudflare) — DDoS, filtrage, cache public
   |
Application (Next.js) — HTTPS obligatoire, secrets via variables d'env
   |
PostgreSQL privé — jamais exposé directement sur Internet, SSL activé,
                    utilisateur applicatif avec permissions minimales
```

- **Base de données** : utilisateur dédié à l'application (pas de rôle
  superuser), connexion SSL, accès réseau restreint au seul service
  applicatif.
- **Secrets** : via variables d'environnement fournies par la plateforme
  d'hébergement, jamais commitées. `.env.example` ne contient aucune valeur
  réelle par conception.
- **Rate limiting distribué** : l'implémentation fournie
  (`lib/security/rate-limit.ts`) est en mémoire locale au process. Pour un
  déploiement multi-instance, brancher Upstash Redis ou équivalent (point
  d'extension déjà prévu dans le fichier, non câblé par défaut).
- **Sauvegardes** : voir BACKUP-RECOVERY.md.
- **Monitoring/alerting** (Sentry, Better Stack, etc.) : non câblé dans ce
  projet. Les événements de sécurité sont journalisés en base
  (table `AuditLog`) ; brancher un exporteur vers un SIEM/outil
  d'observabilité est recommandé avant une exposition à grande échelle.

## Compromis documentés

- **CSP avec `unsafe-inline`** (`next.config.ts`) : point de départ pour ne
  pas casser le rendu Next.js au premier déploiement. Recommandation :
  migrer vers un système de nonces avant une exposition à grande échelle,
  et valider avec un scan DAST en staging.
- **`Advertisement.scriptCode`** : volontairement non exécuté sur les pages
  publiques (voir commentaire dans `ad-slot.tsx`). Si un tag JS tiers est
  réellement nécessaire (régie publicitaire), le charger via une iframe
  sandboxée sur une origine dédiée plutôt que de réintroduire
  `dangerouslySetInnerHTML` sur du JS arbitraire.
