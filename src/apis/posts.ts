import { A_DAY_POSTS_ENDPOINT, PAGE_SIZE } from '@constants/index';
import { stripHtmlTags } from '@utils/format-content';
import { normalizeWpPost, normalizeWpPosts } from '@utils/normalize-wp-post';
import axios from 'axios';
import type { CategoryPostsPage, WpPost } from 'types/wordpress';

const HOME_FEED_QUERY = new URLSearchParams({
  per_page: '60',
  orderby: 'date',
  order: 'desc',
}).toString();

type PostDetailsCache = Readonly<Record<string, unknown>>;

let cachedPostDetailsPromise: Promise<PostDetailsCache> | null = null;

async function loadPostDetailsCache(): Promise<PostDetailsCache> {
  if (!cachedPostDetailsPromise) {
    cachedPostDetailsPromise = import('@assets/cached/post-details.json')
      .then((module) => {
        const data = module.default;
        return data && typeof data === 'object' && !Array.isArray(data)
          ? (data as PostDetailsCache)
          : {};
      })
      .catch(() => ({}));
  }
  return cachedPostDetailsPromise;
}

let bundledPostsNormalizedPromise: Promise<WpPost[]> | null = null;

/** Full list from `posts.json` (normalized once) — shared by id-map and category fallback. */
async function loadBundledPostsNormalized(): Promise<WpPost[]> {
  if (!bundledPostsNormalizedPromise) {
    bundledPostsNormalizedPromise = import('@assets/cached/posts.json')
      .then((module) => {
        const list = Array.isArray(module.default) ? module.default : [];
        return normalizeWpPosts(list);
      })
      .catch(() => []);
  }
  return bundledPostsNormalizedPromise;
}

let bundledPostsByIdPromise: Promise<Map<number, WpPost>> | null = null;

async function loadBundledPostsById(): Promise<Map<number, WpPost>> {
  if (!bundledPostsByIdPromise) {
    bundledPostsByIdPromise = loadBundledPostsNormalized().then((posts) => {
      const map = new Map<number, WpPost>();
      for (const p of posts) map.set(p.id, p);
      return map;
    });
  }
  return bundledPostsByIdPromise;
}

/** True when the post has a non-empty body, including figure/image-only layouts. */
function hasRenderableArticleContent(post: WpPost | null | undefined): post is WpPost {
  if (!post) return false;
  const raw = post.content?.rendered;
  if (typeof raw !== 'string' || !raw.trim()) return false;
  if (stripHtmlTags(raw).trim().length > 0) return true;
  return /<(img|figure|iframe|video|blockquote)\b/i.test(raw);
}

function hasFeaturedImageSrc(post: WpPost): boolean {
  const sizes = post.featured_image?.sizes;
  return Boolean(sizes?.medium?.src || sizes?.full?.src);
}

async function mergeFeaturedImageFromBundledList(post: WpPost): Promise<WpPost> {
  if (hasFeaturedImageSrc(post)) return post;
  try {
    const map = await loadBundledPostsById();
    const fromList = map.get(post.id);
    if (fromList?.featured_image && hasFeaturedImageSrc(fromList)) {
      return { ...post, featured_image: fromList.featured_image };
    }
  } catch {
    /* optional snapshot */
  }
  return post;
}

export function buildCategoryPostsRequestUrl(categoryId: string, offset: number): string {
  const params = new URLSearchParams({
    categories: categoryId,
    per_page: String(PAGE_SIZE),
    offset: String(offset),
    orderby: 'date',
    order: 'desc',
  });
  return `${A_DAY_POSTS_ENDPOINT}?${params.toString()}`;
}

export async function fetchPosts(): Promise<WpPost[]> {
  const { data } = await axios.get(`${A_DAY_POSTS_ENDPOINT}?${HOME_FEED_QUERY}`);
  return normalizeWpPosts(data);
}

export async function fetchPostById(postId: string): Promise<WpPost> {
  const cachedMap = await loadPostDetailsCache();
  const fromDetails = normalizeWpPost(cachedMap[postId]);

  if (fromDetails && hasRenderableArticleContent(fromDetails)) {
    return mergeFeaturedImageFromBundledList(fromDetails);
  }

  let fromNetwork: WpPost | null = null;
  try {
    const { data } = await axios.get(`${A_DAY_POSTS_ENDPOINT}/${postId}`);
    fromNetwork = normalizeWpPost(data);
  } catch {
    fromNetwork = null;
  }

  if (fromNetwork && hasRenderableArticleContent(fromNetwork)) {
    return mergeFeaturedImageFromBundledList(fromNetwork);
  }

  try {
    const map = await loadBundledPostsById();
    const bundled = map.get(Number(postId));
    if (bundled && hasRenderableArticleContent(bundled)) {
      return mergeFeaturedImageFromBundledList(bundled);
    }
  } catch {
    /* ignore */
  }

  throw new Error('Unable to load this article right now.');
}

async function fetchCategoryPostsPageFromBundled(
  categoryId: string,
  offset: number,
): Promise<CategoryPostsPage> {
  const categoryNumericId = Number(categoryId);
  const all = await loadBundledPostsNormalized();
  const filtered = Number.isFinite(categoryNumericId)
    ? all.filter((post) => post.categories.includes(categoryNumericId))
    : [];
  filtered.sort((a, b) => {
    const tb = new Date(b.date ?? 0).getTime();
    const ta = new Date(a.date ?? 0).getTime();
    return tb - ta;
  });
  const posts = filtered.slice(offset, offset + PAGE_SIZE);
  const nextOffset = offset + posts.length;
  const hasMore = nextOffset < filtered.length;
  return { posts, hasMore, nextOffset };
}

/**
 * Category feed: live WordPress first, then **`posts.json`** (same bundle as Home) when the
 * request fails or the body is not a JSON array — e.g. CORS or HTML from a CDN on GitHub Pages.
 */
export async function fetchCategoryPostsPage(
  categoryId: string,
  offset: number,
): Promise<CategoryPostsPage> {
  try {
    const url = buildCategoryPostsRequestUrl(categoryId, offset);
    const response = await axios.get(url);
    if (!Array.isArray(response.data)) {
      return fetchCategoryPostsPageFromBundled(categoryId, offset);
    }
    const posts = normalizeWpPosts(response.data);
    const totalPagesHeader = Number(response.headers['x-wp-totalpages']);
    const totalItemsHeader = Number(response.headers['x-wp-total']);
    const hasValidTotals =
      Number.isFinite(totalPagesHeader) &&
      totalPagesHeader > 0 &&
      Number.isFinite(totalItemsHeader) &&
      totalItemsHeader >= 0;

    const nextOffset = offset + posts.length;
    const hasMore = hasValidTotals
      ? nextOffset < totalItemsHeader
      : posts.length >= PAGE_SIZE;

    return { posts, hasMore, nextOffset };
  } catch {
    return fetchCategoryPostsPageFromBundled(categoryId, offset);
  }
}

export default fetchPosts;
