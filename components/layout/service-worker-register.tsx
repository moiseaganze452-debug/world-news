"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // L'échec d'enregistrement du service worker ne doit jamais bloquer
        // le rendu ou l'usage normal du site — la PWA est une amélioration
        // progressive, pas une dépendance.
      });
    }
  }, []);

  return null;
}
