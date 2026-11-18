import { prisma } from "@/lib/db/prisma";

/**
 * Charge les réglages d'apparence (Admin → Apparence → Couleurs / Identité)
 * depuis la table Setting et les retourne sous forme d'objet exploitable.
 *
 * Convention de clés dans Setting.key :
 *   colors.primary, colors.secondary, colors.accent, colors.background,
 *   colors.text, colors.header, colors.footer,
 *   identity.siteName, identity.tagline, identity.logoUrl, identity.faviconUrl,
 *   typography.fontPrimary, typography.fontHeading
 *
 * Utilisé dans app/layout.tsx pour injecter un <style> avec les variables CSS
 * personnalisées et respecter la règle « tout doit être modifiable sans code ».
 */
export interface SiteTheme {
  colors: Record<string, string>;
  identity: {
    siteName: string;
    tagline: string;
    logoUrl: string | null;
    faviconUrl: string | null;
  };
  typography: {
    fontPrimary: string;
    fontHeading: string;
  };
  /** Mode par défaut choisi dans Admin → Apparence (§28) : "light" | "dark" | "system" */
  defaultMode: "light" | "dark" | "system";
}

const DEFAULTS: SiteTheme = {
  colors: {
    primary: "213 63% 14%",
    secondary: "0 65% 47%",
    accent: "0 65% 47%",
    background: "0 0% 100%",
    text: "220 39% 11%",
  },
  identity: {
    siteName: "World News",
    tagline: "L'information qui vous connecte au monde.",
    logoUrl: null,
    faviconUrl: null,
  },
  typography: {
    fontPrimary: "Inter",
    fontHeading: "Inter",
  },
  defaultMode: "system",
};

export async function getSiteTheme(): Promise<SiteTheme> {
  try {
    const settings = await prisma.setting.findMany({
      where: { group: { in: ["couleurs", "identite", "typographie", "general"] } },
    });

    if (settings.length === 0) return DEFAULTS;

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return {
      colors: {
        primary: map["colors.primary"] ?? DEFAULTS.colors.primary,
        secondary: map["colors.secondary"] ?? DEFAULTS.colors.secondary,
        accent: map["colors.accent"] ?? DEFAULTS.colors.accent,
        background: map["colors.background"] ?? DEFAULTS.colors.background,
        text: map["colors.text"] ?? DEFAULTS.colors.text,
      },
      identity: {
        siteName: map["identity.siteName"] ?? DEFAULTS.identity.siteName,
        tagline: map["identity.tagline"] ?? DEFAULTS.identity.tagline,
        logoUrl: map["identity.logoUrl"] ?? null,
        faviconUrl: map["identity.faviconUrl"] ?? null,
      },
      typography: {
        fontPrimary: map["typography.fontPrimary"] ?? DEFAULTS.typography.fontPrimary,
        fontHeading: map["typography.fontHeading"] ?? DEFAULTS.typography.fontHeading,
      },
      defaultMode: (map["general.defaultThemeMode"] as SiteTheme["defaultMode"]) ?? DEFAULTS.defaultMode,
    };
  } catch {
    // En cas d'échec DB (ex: premier démarrage avant migration), retomber sur les valeurs par défaut
    return DEFAULTS;
  }
}
