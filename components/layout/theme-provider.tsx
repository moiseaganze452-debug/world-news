"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Enrobe next-themes pour gérer clair / sombre / système (§28).
 * Le mode PAR DÉFAUT est piloté par Admin → Apparence (Setting: theme.defaultMode)
 * et transmis en prop `defaultTheme` depuis app/layout.tsx (Server Component),
 * ce qui respecte la règle « administrable sans toucher au code ».
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
