import { z } from "zod";

/**
 * Toutes les valeurs sont stockées en HSL "H S% L%" (sans la fonction hsl())
 * pour rester compatibles avec les variables CSS déjà consommées dans
 * app/globals.css et app/layout.tsx (voir lib/seo/theme.ts).
 */
const hslPattern = /^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/;

export const appearanceSchema = z.object({
  siteName: z.string().min(2).max(80),
  tagline: z.string().max(150).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),

  colorPrimary: z.string().regex(hslPattern, "Format attendu : H S% L%"),
  colorSecondary: z.string().regex(hslPattern, "Format attendu : H S% L%"),
  colorAccent: z.string().regex(hslPattern, "Format attendu : H S% L%"),
  colorBackground: z.string().regex(hslPattern, "Format attendu : H S% L%"),
  colorText: z.string().regex(hslPattern, "Format attendu : H S% L%"),

  fontPrimary: z.string().min(1).max(60),
  fontHeading: z.string().min(1).max(60),

  defaultMode: z.enum(["light", "dark", "system"]),
});

export type AppearanceInput = z.infer<typeof appearanceSchema>;
