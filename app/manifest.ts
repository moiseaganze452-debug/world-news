import type { MetadataRoute } from "next";
import { getSiteTheme } from "@/lib/seo/theme";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const theme = await getSiteTheme();

  // Convertit "H S% L%" en couleur CSS valide pour theme_color/background_color.
  const toHslCss = (hsl: string) => `hsl(${hsl})`;

  return {
    name: theme.identity.siteName,
    short_name: theme.identity.siteName,
    description: theme.identity.tagline,
    start_url: "/",
    display: "standalone",
    background_color: toHslCss(theme.colors.background),
    theme_color: toHslCss(theme.colors.primary),
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
