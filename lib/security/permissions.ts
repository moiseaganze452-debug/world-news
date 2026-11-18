/**
 * Système de permissions (RBAC) — World News
 *
 * Chaque rôle est associé à une liste de permissions.
 * Utiliser `can(role, permission)` partout où un accès doit être vérifié :
 * Server Actions, Route Handlers, Server Components de l'admin, middleware.
 *
 * Ne jamais faire confiance uniquement à l'UI cachée côté client :
 * toute action sensible doit revérifier la permission côté serveur.
 */

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EDITOR"
  | "JOURNALIST"
  | "AUTHOR"
  | "MODERATOR"
  | "AD_MANAGER"
  | "ANALYST";

export type Permission =
  | "articles.create"
  | "articles.edit.own"
  | "articles.edit.all"
  | "articles.delete"
  | "articles.publish"
  | "categories.manage"
  | "authors.manage"
  | "users.manage"
  | "users.manage.roles"
  | "media.manage"
  | "comments.moderate"
  | "pages.manage"
  | "menus.manage"
  | "ads.manage"
  | "ads.manage.scripts"
  | "newsletter.manage"
  | "seo.manage"
  | "appearance.manage"
  | "settings.manage"
  | "security.manage"
  | "analytics.view"
  | "notifications.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "articles.create",
    "articles.edit.own",
    "articles.edit.all",
    "articles.delete",
    "articles.publish",
    "categories.manage",
    "authors.manage",
    "users.manage",
    "users.manage.roles",
    "media.manage",
    "comments.moderate",
    "pages.manage",
    "menus.manage",
    "ads.manage",
    "ads.manage.scripts",
    "newsletter.manage",
    "seo.manage",
    "appearance.manage",
    "settings.manage",
    "security.manage",
    "analytics.view",
    "notifications.manage",
  ],
  ADMIN: [
    "articles.create",
    "articles.edit.own",
    "articles.edit.all",
    "articles.delete",
    "articles.publish",
    "categories.manage",
    "authors.manage",
    "users.manage",
    "media.manage",
    "comments.moderate",
    "pages.manage",
    "menus.manage",
    "ads.manage",
    "newsletter.manage",
    "seo.manage",
    "appearance.manage",
    "settings.manage",
    "analytics.view",
    "notifications.manage",
    // Exclu : users.manage.roles, security.manage, ads.manage.scripts
    // (fonctions critiques capables d'exécuter du code arbitraire côté
    // client public — réservées SUPER_ADMIN, voir §56 modèle de menace).
  ],
  EDITOR: [
    "articles.create",
    "articles.edit.own",
    "articles.edit.all",
    "articles.publish",
    "categories.manage",
    "authors.manage",
    "media.manage",
    "comments.moderate",
    "pages.manage",
    "menus.manage",
    "analytics.view",
  ],
  JOURNALIST: [
    "articles.create",
    "articles.edit.own",
    "media.manage",
    "analytics.view",
  ],
  AUTHOR: ["articles.create", "articles.edit.own", "media.manage"],
  MODERATOR: ["comments.moderate"],
  AD_MANAGER: ["ads.manage", "analytics.view"],
  ANALYST: ["analytics.view"],
};

export function can(role: Role | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as Role];
  return permissions ? permissions.includes(permission) : false;
}

export function canAny(role: Role | string | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

export function requirePermission(role: Role | string | undefined, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`Accès refusé : permission "${permission}" requise.`);
  }
}
