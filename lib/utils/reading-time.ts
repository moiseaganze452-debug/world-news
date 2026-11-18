/**
 * Calcule le temps de lecture estimé d'un article (en minutes),
 * affiché automatiquement sur la page article (§38 du cahier des charges).
 */
const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(plainText: string): number {
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}
