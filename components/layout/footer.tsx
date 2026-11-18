import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, MessageCircle, Send, Music2 } from "lucide-react";
import { getEnabledSocialLinks, getCategoriesWithCount } from "@/services/public-content-service";
import { getSiteTheme } from "@/lib/seo/theme";
import { AdSlot } from "@/components/advertising/ad-slot";

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  telegram: Send,
  tiktok: Music2,
};

export async function SiteFooter() {
  const [socialLinks, categories, theme] = await Promise.all([
    getEnabledSocialLinks(),
    getCategoriesWithCount(6),
    getSiteTheme(),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-bold">{theme.identity.siteName}</p>
          <p className="mt-2 text-sm text-primary-foreground/70">{theme.identity.tagline}</p>

          <div className="mt-4 flex gap-2">
            {socialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.platform];
              if (!Icon) return null;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                  aria-label={link.platform}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Catégories
          </p>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${c.slug}`} className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Liens rapides
          </p>
          <ul className="space-y-2">
            <li><Link href="/a-propos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">À propos</Link></li>
            <li><Link href="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Contact</Link></li>
            <li><Link href="/politique-confidentialite" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Politique de confidentialité</Link></li>
            <li><Link href="/conditions" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Conditions d'utilisation</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Newsletter
          </p>
          <p className="mb-3 text-sm text-primary-foreground/70">
            Recevez les principales informations directement dans votre boîte mail.
          </p>
          <NewsletterFooterForm />
        </div>
      </div>

      {/* Publicité pied de page (§22) — fond clair pour rester lisible sur le footer sombre */}
      <div className="border-t border-white/10 bg-background py-6">
        <div className="container">
          <AdSlot placement="FOOTER" />
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/60">
        © {year} {theme.identity.siteName}. Tous droits réservés.
      </div>
    </footer>
  );
}

function NewsletterFooterForm() {
  return (
    <form action="/api/newsletter" method="POST" className="flex gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="Votre email"
        className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/40"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
      >
        OK
      </button>
    </form>
  );
}
