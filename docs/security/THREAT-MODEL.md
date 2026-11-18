# THREAT-MODEL.md — World News

## Acteurs

| Acteur | Capacités |
|---|---|
| Visiteur anonyme | Lecture publique, commentaires, inscription newsletter, recherche |
| AUTHOR | Rédaction/édition de ses propres articles |
| EDITOR | Édition de tout contenu, pages, modération commentaires |
| AD_MANAGER | Gestion des publicités (hors scriptCode) |
| ADMIN | Gestion utilisateurs, paramètres, contenu — hors rôles critiques |
| SUPER_ADMIN | Tout, y compris rôles, sécurité, scripts publicitaires |
| Compte compromis | Capacités du rôle volé, potentiellement au-delà de l'usage normal (rythme de requêtes, heures inhabituelles) |
| Attaquant externe non authentifié | Toute action offerte aux visiteurs anonymes, plus tentatives d'exploitation |

## Actifs et risques principaux (post-correction)

| Actif | Menace principale | Protection en place |
|---|---|---|
| Sessions admin | Vol de session, session non révoquée après compromission | Cookies HttpOnly/Secure (Auth.js), sessionVersion pour révocation |
| Comptes | Brute force, credential stuffing | Rate limiting login (IP + compte), bcrypt cost 12 |
| Trafic public (visiteurs) | XSS stocké via pub/pages | Sanitization DOMPurify, CSP, permission séparée pour scripts |
| Base PostgreSQL | Injection SQL | Prisma paramétré exclusivement, aucun SQL brut |
| Fichiers uploadés | Upload de fichier malveillant déguisé | Validation magic-bytes, nom serveur aléatoire, quota de taille |
| Données abonnés newsletter (PII) | Export non autorisé ou par session révoquée | Permission stricte, session vérifiée explicitement, rate limit, journalisation |
| Ressources serveur (DB, CPU) | DoS applicatif via recherche/pagination/commentaires | Pagination bornée, rate limiting, longueur de requête limitée |

## Ce que ce modèle ne couvre pas

Ce document couvre les risques applicatifs identifiés dans le code source.
Il ne couvre pas — car hors du périmètre auditable dans cet environnement —
l'infrastructure réelle de déploiement (WAF, CDN, réseau DB, secrets manager,
CI/CD). Voir SECURITY-ARCHITECTURE.md pour les recommandations à ce niveau.
