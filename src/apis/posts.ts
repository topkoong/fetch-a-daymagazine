import { A_DAY_POSTS_ENDPOINT, PAGE_SIZE } from '@constants/index';
import { normalizeWpPosts } from '@utils/normalize-wp-post';
import axios from 'axios';
import type { CategoryPostsPage, WpPost } from 'types/wordpress';

const HOME_FEED_QUERY = new URLSearchParams({
  per_page: '60',
  orderby: 'date',
  order: 'desc',
}).toString();

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
