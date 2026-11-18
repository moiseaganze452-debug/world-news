"use client";

import { useEffect, useRef } from "react";

/**
 * Composant invisible qui enregistre une impression publicitaire au montage.
 * Séparé en client component pour ne pas rendre AdSlot (Server Component)
 * client dans son ensemble.
 */
export function AdImpressionTracker({ adId }: { adId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch(`/api/ads/${adId}/impression`, { method: "POST" }).catch(() => {
      // Le suivi d'impression est accessoire : un échec réseau ne doit pas
      // perturber l'affichage de la publicité elle-même.
    });
  }, [adId]);

  return null;
}
