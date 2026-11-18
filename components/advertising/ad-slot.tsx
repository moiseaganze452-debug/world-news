import { prisma } from "@/lib/db/prisma";
import { AdImpressionTracker } from "@/components/advertising/ad-impression-tracker";
import { sanitizeAdHtml } from "@/lib/security/sanitize";

type AdPlacement = "HEADER" | "HOMEPAGE" | "ENTRE_ARTICLES" | "SIDEBAR" | "ARTICLE" | "FOOTER" | "MOBILE";

// Les emplacements bannière (larges, courts) diffèrent des emplacements
// carrés (sidebar) : le ratio d'affichage placeholder suit le contexte réel
// plutôt qu'un carré partout, pour ne pas déformer la mise en page quand
// aucune publicité n'est encore configurée.
const BANNER_PLACEMENTS: AdPlacement[] = ["HEADER", "HOMEPAGE", "ENTRE_ARTICLES", "ARTICLE", "FOOTER", "MOBILE"];

/**
 * Récupère et affiche une publicité active pour un emplacement donné (§22).
 * Une publicité est éligible si son statut est ACTIVE et que la date du jour
 * est dans sa fenêtre startDate/endDate (fenêtre ouverte si non renseignées).
 *
 * hideIfEmpty : si vrai, ne rend rien du tout en l'absence de publicité
 * active plutôt que d'afficher le placeholder pointillé — utile pour des
 * emplacements sensibles à l'espace comme le header sticky, où un
 * placeholder permanent dégraderait l'expérience plus qu'il n'aide.
 */
/**
 * SÉCURITÉ (§56/§57) : le champ Advertisement.scriptCode (JS arbitraire)
 * n'est intentionnellement PAS rendu ici. L'exécuter via
 * dangerouslySetInnerHTML sur une page publique donnerait à n'importe quel
 * compte disposant de "ads.manage.scripts" (ou un attaquant ayant compromis
 * un tel compte) la capacité d'exécuter du JavaScript sur tout le trafic
 * du site — vol de cookies/session admin, phishing, cryptomining, etc.
 * Recommandation de déploiement sécurisé : si un tag JS tiers (régie pub,
 * remarketing) est réellement nécessaire, le charger via une <iframe
 * sandbox="allow-scripts allow-same-origin"> pointant vers une origine
 * dédiée et isolée, jamais injecté directement dans le DOM du site.
 */
export async function AdSlot({ placement, hideIfEmpty = false }: { placement: AdPlacement; hideIfEmpty?: boolean }) {
  const now = new Date();
  const isBanner = BANNER_PLACEMENTS.includes(placement);

  const ad = await prisma.advertisement.findFirst({
    where: {
      placement,
      status: "ACTIVE",
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!ad) {
    if (hideIfEmpty) return null;

    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground ${
          isBanner ? "h-24 w-full" : "aspect-square"
        }`}
      >
        Emplacement publicitaire
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <AdImpressionTracker adId={ad.id} />

      {ad.htmlCode ? (
        // Défense en profondeur : le champ est déjà sanitizé à l'écriture
        // (voir resolveAdCodeFields), mais on ne fait jamais confiance à
        // une seule couche pour du contenu injecté dans une page publique.
        <div dangerouslySetInnerHTML={{ __html: sanitizeAdHtml(ad.htmlCode) }} />
      ) : ad.imageUrl ? (
        <AdImageLink adId={ad.id} imageUrl={ad.imageUrl} linkUrl={ad.linkUrl} name={ad.name} isBanner={isBanner} />
      ) : null}
    </div>
  );
}

function AdImageLink({
  adId,
  imageUrl,
  linkUrl,
  name,
  isBanner,
}: {
  adId: string;
  imageUrl: string;
  linkUrl: string | null;
  name: string;
  isBanner: boolean;
}) {
  const content = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={name} className={`w-full object-cover ${isBanner ? "h-24" : "h-full"}`} />
  );

  if (!linkUrl) return content;

  return (
    <a href={`/api/ads/${adId}/click`} target="_blank" rel="noopener noreferrer sponsored">
      {content}
    </a>
  );
}
