import slugify from "slugify";

export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "fr",
    trim: true,
  });
}

/**
 * Génère un slug garanti unique en ajoutant un suffixe numérique si nécessaire.
 * `exists` doit retourner true si le slug candidat est déjà pris.
 */
export async function toUniqueSlug(
  text: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = toSlug(text);
  let candidate = base;
  let counter = 2;

  while (await exists(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}
