import { headers } from "next/headers";

/**
 * Extrait l'adresse IP du client dans un contexte Server Action (où il
 * n'y a pas de `Request` direct). Se base sur les headers standards posés
 * par le reverse proxy / CDN en production (§86 — Cloudflare/CDN devant
 * l'application).
 *
 * NON VÉRIFIÉ : le nom exact du header dépend de l'infrastructure réelle
 * de déploiement (Cloudflare pose `cf-connecting-ip`, d'autres proxys
 * `x-real-ip`). À confirmer/ajuster selon l'hébergeur choisi — voir
 * SECURITY-ARCHITECTURE.md. En local (`next dev`), ces headers sont
 * absents et la fonction retourne "unknown", ce qui dégrade le rate
 * limiting par IP à un bucket partagé unique — acceptable en dev, pas
 * en production sans CDN/proxy configuré correctement.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = headersList.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]!.trim();

  return "unknown";
}
