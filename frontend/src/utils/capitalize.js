/**
 * Capitalize the first letter of each word in a string.
 * Returns empty string for falsy input.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

const SKIP_WORDS = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'at', 'to', 'a', 'an']);

/**
 * Display name for organizations.
 * If the name has 4+ words (space-separated), returns an abbreviation
 * (first letter of each significant word, skipping articles/prepositions).
 * Hyphenated words like "Co-Curricular" count as one word → single letter "C".
 * Otherwise returns the capitalized full name.
 */
export const orgDisplayName = (name) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length < 4) return capitalize(name);
  const abbr = words
    .filter((w) => !SKIP_WORDS.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join('');
  return abbr;
};
