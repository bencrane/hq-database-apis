/**
 * Extract LinkedIn slug from a full LinkedIn URL.
 *
 * Examples:
 *   "https://linkedin.com/in/johndoe" → "johndoe"
 *   "https://www.linkedin.com/in/john-doe-123abc" → "john-doe-123abc"
 *   "johndoe" → "johndoe" (already a slug)
 *
 * Returns null if the URL is invalid or slug cannot be extracted.
 */
export function extractLinkedInSlug(urlOrSlug: string): string | null {
  if (!urlOrSlug) return null;

  const trimmed = urlOrSlug.trim();

  // If it's already a slug (no slashes or protocol)
  if (!trimmed.includes("/") && !trimmed.includes(":")) {
    return trimmed;
  }

  // Try to parse as URL
  try {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Expected format: /in/{slug}
    if (pathParts[0] === "in" && pathParts[1]) {
      return pathParts[1];
    }

    return null;
  } catch {
    // Not a valid URL, check if it looks like a path
    const match = trimmed.match(/\/in\/([^\/\?]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Build a full LinkedIn URL from a slug.
 */
export function buildLinkedInUrl(slug: string): string {
  return `https://linkedin.com/in/${slug}`;
}

