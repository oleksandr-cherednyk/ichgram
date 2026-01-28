/**
 * Extracts and normalizes hashtags from text
 * Returns unique lowercase hashtags, max 10
 */
export const extractHashtags = (text: string): string[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Match all hashtags: #word (letters, digits, underscore)
  const matches = text.match(/#(\w+)/g);
  if (!matches || matches.length === 0) {
    return [];
  }

  // Normalize: remove #, lowercase, unique
  const normalized = matches.map((tag) => tag.slice(1).toLowerCase());
  const unique = [...new Set(normalized)];

  // Limit to 10 to prevent spam
  return unique.slice(0, 10);
};
