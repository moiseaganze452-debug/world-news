import Link from "next/link";
import { Search } from "lucide-react";
import { getMainMenu, getBreakingNews } from "@/services/public-content-service";
import { getSiteTheme } from "@/lib/seo/theme";
import { MobileMenuButton } from "@/components/navigation/mobile-menu-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AdSlot } from "@/components/advertising/ad-slot";

export async function SiteHeader() {
  const [menuItems, breaking, theme] = await Promise.all([
    getMainMenu(),
    getBreakingNews(),
    getSiteTheme(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {breaking && (
        <div className="overflow-hidden whitespace-nowrap bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
          <Link href={`/article/${breaking.slug}`} className="inline-flex items-center gap-2">
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              Urgent
            </span>
            {breaking.title}
          </Link>
        </div>
      )}

      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          {theme.identity.siteName}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={resolveMenuHref(item)}
              className="text-sm font-medium text-foreground/80 transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/recherche"
            className="rounded-full p-2 text-foreground/70 transition hover:bg-muted hover:text-foreground"
            aria-label="Rechercher"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>
          <MobileMenuButton items={menuItems.map((i) => ({ label: i.label, href: resolveMenuHref(i) }))} />
        </div>
      </div>

      {/* Publicité en-tête (§22) — non sticky, sous la barre de nav ; masquée si aucune pub active */}
      <div className="container pb-3">
        <AdSlot placement="HEADER" hideIfEmpty />
      </div>
    </header>
  );
}

function resolveMenuHref(item: { type: string; url: string | null; resolvedSlug: string | null }): string {
  if (item.type === "URL" && item.url) return item.url;
  if (item.type === "CATEGORIE" && item.resolvedSlug) return `/categorie/${item.resolvedSlug}`;
  if (item.type === "PAGE" && item.resolvedSlug) return `/${item.resolvedSlug}`;
  return "#";
}
