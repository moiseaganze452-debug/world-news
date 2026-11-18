import type { Permission } from "@/lib/security/permissions";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string; // nom d'icône lucide-react, résolu côté composant
  permission: Permission | null; // null = accessible à tout utilisateur connecté
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

/**
 * Structure de navigation du panneau d'administration (§13 du cahier des charges).
 * Chaque entrée porte la permission requise pour l'afficher : le composant
 * de sidebar (components/admin/sidebar.tsx) filtre cette liste avec `can()`
 * en fonction du rôle de l'utilisateur connecté.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Vue générale",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard", permission: null }],
  },
  {
    title: "Contenu éditorial",
    items: [
      { label: "Articles", href: "/admin/articles", icon: "Newspaper", permission: "articles.create" },
      { label: "Catégories", href: "/admin/categories", icon: "FolderTree", permission: "categories.manage" },
      { label: "Auteurs", href: "/admin/auteurs", icon: "Users", permission: "authors.manage" },
      { label: "Commentaires", href: "/admin/commentaires", icon: "MessageSquare", permission: "comments.moderate" },
      { label: "Médias", href: "/admin/medias", icon: "Image", permission: "media.manage" },
    ],
  },
  {
    title: "Structure du site",
    items: [
      { label: "Pages", href: "/admin/pages", icon: "FileText", permission: "pages.manage" },
      { label: "Menus", href: "/admin/menus", icon: "Menu", permission: "menus.manage" },
      { label: "Apparence", href: "/admin/apparence", icon: "Palette", permission: "appearance.manage" },
    ],
  },
  {
    title: "Croissance & Monétisation",
    items: [
      { label: "Publicités", href: "/admin/publicites", icon: "Megaphone", permission: "ads.manage" },
      { label: "Newsletter", href: "/admin/newsletter", icon: "Mail", permission: "newsletter.manage" },
      { label: "SEO", href: "/admin/seo", icon: "Search", permission: "seo.manage" },
      { label: "Statistiques", href: "/admin/statistiques", icon: "BarChart3", permission: "analytics.view" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Utilisateurs", href: "/admin/utilisateurs", icon: "UserCog", permission: "users.manage" },
      { label: "Notifications", href: "/admin/notifications", icon: "Bell", permission: null },
      { label: "Paramètres", href: "/admin/parametres", icon: "Settings", permission: "settings.manage" },
      { label: "Sécurité", href: "/admin/securite", icon: "Shield", permission: "security.manage" },
    ],
  },
];
