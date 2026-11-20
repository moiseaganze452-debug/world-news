import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitization centralisée de tout contenu HTML fourni par un utilisateur
 * avant rendu via dangerouslySetInnerHTML (§13/§56/§57 — XSS, publicité,
 * contenu riche).
 *
 * Deux profils :
 * - CONTENT : contenu éditorial riche (articles, pages) — balises de mise
 *   en forme + médias, mais jamais de script ni de handler JS.
 * - AD_HTML : code publicitaire HTML/embeds — profil volontairement plus
 *   restrictif, aucune balise de script n'est jamais autorisée ici.
 *
 * Important : `scriptCode` publicitaire ne doit PAS passer par ce
 * sanitizer pour être exécuté tel quel. Voir §AD_SCRIPTS ci-dessous :
 * le JS arbitraire est un privilège séparé, réservé à SUPER_ADMIN,
 * et n'est jamais proposé aux rôles ADMIN/AD_MANAGER standards.
 */

const CONTENT_ALLOWED_TAGS = [
  "p", "br", "hr",
  "strong", "em", "b", "i", "u", "s", "mark", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "iframe", // whitelisté uniquement pour les embeds YouTube (voir ALLOWED_URI_REGEXP)
];

const CONTENT_ALLOWED_ATTR = [
  "href", "src", "alt", "title", "target", "rel",
  "class", "width", "height", "frameborder", "allow", "allowfullscreen",
  "colspan", "rowspan",
];

// N'autorise les iframes/liens que vers des origines de confiance connues
// (embeds vidéo). Bloque data:, javascript:, vbscript:, et tout domaine
// arbitraire pour les balises capables de charger du contenu actif.
const TRUSTED_EMBED_HOSTS = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//;

export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: CONTENT_ALLOWED_TAGS,
    ALLOWED_ATTR: CONTENT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "object", "embed", "form", "input", "svg", "math"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    ADD_URI_SAFE_ATTR: [],
    // Empêche javascript:/data: dans href/src
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  }).replace(/<iframe(?![^>]*\ssrc=["']https:\/\/(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com)\/)[^>]*>.*?<\/iframe>/gi, "");
}

/**
 * Profil pour le code HTML publicitaire (Advertisement.htmlCode) : plus
 * restrictif que le contenu éditorial. Pas d'iframe libre, pas de <a>
 * avec handlers, uniquement de la mise en forme + image + lien simple.
 */
export function sanitizeAdHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["div", "span", "a", "img", "p", "br", "strong", "em"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "svg"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}

/**
 * Sanitization d'un commentaire : texte quasi brut, aucune balise HTML.
 * Les commentaires ne doivent jamais permettre de mise en forme riche.
 */
export function sanitizeCommentText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
