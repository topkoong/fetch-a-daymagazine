import fetchPosts from '@apis/posts';
import { normalizeWpPosts } from '@utils/normalize-wp-post';
import type { WpPost } from 'types/wordpress';

/** Live API first, then bundled posts (mobile vs full cache). */
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
