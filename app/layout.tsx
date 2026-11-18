import type { Metadata } from "next";
import { getSiteTheme } from "@/lib/seo/theme";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getSiteTheme();

  return {
    title: {
      default: theme.identity.siteName,
      template: `%s — ${theme.identity.siteName}`,
    },
    description: theme.identity.tagline,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    manifest: "/manifest.webmanifest",
    openGraph: {
      siteName: theme.identity.siteName,
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: theme.identity.faviconUrl || "/icons/favicon.png",
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getSiteTheme();

  // Injecte les couleurs choisies dans l'admin en surchargeant les variables
  // CSS par défaut définies dans globals.css — c'est ce mécanisme qui permet
  // à Admin → Apparence → Couleurs de changer le rendu sans toucher au code.
  //
  // Choix assumé : ces surcharges ne ciblent que :root (mode clair). Le mode
  // sombre (.dark, défini dans globals.css) garde sa palette calibrée en
  // interne plutôt que de recalculer un contraste sûr à partir d'une couleur
  // admin arbitraire — évite qu'un choix de couleur clair dans l'admin rende
  // le mode sombre illisible. Si l'admin doit un jour piloter aussi le mode
  // sombre, ajouter des clés colors.dark.* distinctes plutôt que de réutiliser
  // colors.primary telles quelles.
  const themeStyle = `
    :root {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --background: ${theme.colors.background};
      --foreground: ${theme.colors.text};
      --font-sans: "${theme.typography.fontPrimary}", system-ui, sans-serif;
      --font-heading: "${theme.typography.fontHeading}", system-ui, sans-serif;
    }
  `;

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={theme.defaultMode ?? "system"}>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
