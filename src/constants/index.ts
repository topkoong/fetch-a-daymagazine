/** Default editorial site; all post/category feeds use its WordPress REST API. */
const DEFAULT_ADAY_ORIGIN = 'https://adaymagazine.com';

function normalizeOrigin(raw: string | undefined): string {
  if (!raw?.trim()) return DEFAULT_ADAY_ORIGIN;
  return raw.replace(/\/+$/, '');
}

/**
 * Canonical origin for news from https://adaymagazine.com/ (WordPress REST).
 * Override at build time with VITE_ADAY_MAGAZINE_ORIGIN (no trailing slash).
 */
export const A_DAY_HOSTNAME = normalizeOrigin(import.meta.env.VITE_ADAY_MAGAZINE_ORIGIN);

export const A_DAY_POSTS_ENDPOINT = `${A_DAY_HOSTNAME}/wp-json/wp/v2/posts`;
export const A_DAY_CATEGORIES_ENDPOINT = `${A_DAY_HOSTNAME}/wp-json/wp/v2/categories`;
export const PAGE_SIZE = 8;
export const REFETCH_INTERVAL = 1000 * 60 * 5;
/** Default stale window aligned with editorial refresh expectations. */
export const DEFAULT_STALE_TIME_MS = REFETCH_INTERVAL;
