import {
  A_DAY_POSTS_ENDPOINT,
  PAGE_SIZE,
} from '@constants/index';
import type { CategoryPostsPage, WpPost } from 'types/wordpress';
import axios from 'axios';

const HOME_FEED_QUERY = new URLSearchParams({
  per_page: '60',
  orderby: 'date',
  order: 'desc',
}).toString();

export function buildCategoryPostsRequestUrl(
  categoryId: string,
  offset: number,
): string {
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
  const { data } = await axios.get<WpPost[]>(
    `${A_DAY_POSTS_ENDPOINT}?${HOME_FEED_QUERY}`,
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchCategoryPostsPage(
  categoryId: string,
  offset: number,
): Promise<CategoryPostsPage> {
  const url = buildCategoryPostsRequestUrl(categoryId, offset);
  const { data } = await axios.get<WpPost[]>(url);
  return { posts: Array.isArray(data) ? data : [] };
}

export default fetchPosts;
