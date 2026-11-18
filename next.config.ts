import type { NextConfig } from "next";

/**
 * Content-Security-Policy (§14).
 *
 * NON VÉRIFIÉ EN CONDITIONS RÉELLES : cette politique n'a pas pu être
 * testée contre un build + navigateur réel dans cet environnement (pas
 * d'accès réseau pour `npm install`/`next build`/tests DAST — voir
 * SECURITY-TESTING.md). Next.js 15 nécessite généralement 'unsafe-inline'
 * ou un mécanisme de nonce pour ses scripts injectés au runtime ; on
 * démarre ici avec 'unsafe-inline' en script-src pour ne pas casser
 * l'application au premier déploiement, ce qui est un compromis
 * documenté plutôt qu'une politique idéale. Recommandation avant
 * exposition production à grande échelle : migrer vers une CSP à base
 * de nonces (voir next.config nonce pattern officiel Next.js) et retirer
 * 'unsafe-inline', puis valider avec un scan DAST en staging (§64).
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' toléré temporairement pour script-src — voir note
  // ci-dessus. object-src reste bloqué sans exception (§14).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Autorise uniquement les origines d'embeds explicitement gérées par
  // le sanitizer de contenu (voir lib/security/sanitize.ts).
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // §47 Clickjacking : seule notre propre origine peut s'iframer elle-même.
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
          // §45/§85 — isole le contexte de navigation (protège contre
          // certaines classes d'attaques cross-origin type Spectre/tabnabbing)
          // et empêche d'autres origines de lire nos ressources sans CORS explicite.
          // N'affecte pas le chargement des images externes (Cloudinary/R2/S3/
          // Unsplash) : CORP protège les ressources que NOUS servons, pas
          // celles que nous consommons depuis l'extérieur.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/article",
        destination: "/",
        permanent: false,
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
