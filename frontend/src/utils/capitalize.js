/**
 * Capitalize the first letter of each word in a string.
 * Returns empty string for falsy input.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};
