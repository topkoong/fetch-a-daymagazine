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

let bundledPostsByIdPromise: Promise<Map<number, WpPost>> | null = null;

async function loadBundledPostsById(): Promise<Map<number, WpPost>> {
  if (!bundledPostsByIdPromise) {
    bundledPostsByIdPromise = import('@assets/cached/posts.json').then((module) => {
      const list = Array.isArray(module.default) ? module.default : [];
      const map = new Map<number, WpPost>();
      for (const row of list) {
        const p = normalizeWpPost(row);
        if (p) map.set(p.id, p);
      }
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

export async function fetchCategoryPostsPage(
  categoryId: string,
  offset: number,
): Promise<CategoryPostsPage> {
  const url = buildCategoryPostsRequestUrl(categoryId, offset);
  const response = await axios.get(url);
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
}

export default fetchPosts;
