import fetchPosts from '@apis/posts';
import { normalizeWpPosts } from '@utils/normalize-wp-post';
import type { WpPost } from 'types/wordpress';

/**
 * Shared magazine list loader for **Home** and **PostDetails** (related articles).
 *
 * **Why it exists:** Both screens need the same post array shape and the same fallback strategy
 * so TanStack Query can dedupe by `queryKeys.allPosts` when users navigate home → article.
 *
 * **Flow:**
 * 1. Try `fetchPosts()` (live WordPress REST, same query as the home hero/feed).
 * 2. On network/build failure (offline, CI, CORS in odd envs), import bundled JSON from
 *    `src/assets/cached/` and run `normalizeWpPosts` so types match the live path.
 *
 * @param useMobileCache - When true, falls back to `mobile-posts.json` (smaller payload for
 *   narrow breakpoints on Home). When false, uses full `posts.json`. PostDetails passes the
 *   same flag as Home so the cached query key shares one logical dataset per device class.
 */
export async function fetchMagazinePostsWithFallback(
  useMobileCache: boolean,
): Promise<WpPost[]> {
  try {
    return await fetchPosts();
  } catch {
    const module = useMobileCache
      ? await import('@assets/cached/mobile-posts.json')
      : await import('@assets/cached/posts.json');
    const data = module.default;
    if (!Array.isArray(data)) return [];
    return normalizeWpPosts(data);
  }
}
