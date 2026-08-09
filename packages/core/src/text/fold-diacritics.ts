const COMBINING_MARK_PATTERN = /\p{M}/gu;

/**
 * Removes accents/diacritics so "García" and "Garcia" compare equal.
 * Uses Unicode NFD decomposition (portable, no locale tables).
 */
export function foldDiacritics(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARK_PATTERN, '');
}

/**
 * Case- and accent-insensitive text for substring or term matching.
 */
export function normalizeForSearch(text: string): string {
  return foldDiacritics(text.toLowerCase());
}
