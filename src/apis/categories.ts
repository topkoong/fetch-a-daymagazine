import { A_DAY_CATEGORIES_ENDPOINT } from '@constants/index';
import axios from 'axios';
import type { WpCategory } from 'types/wordpress';

const CATEGORY_LIST_QUERY = new URLSearchParams({
  per_page: '60',
  orderby: 'name',
  order: 'asc',
}).toString();

async function fetchCategories(): Promise<WpCategory[]> {
  const { data } = await axios.get<WpCategory[]>(
    `${A_DAY_CATEGORIES_ENDPOINT}?${CATEGORY_LIST_QUERY}`,
  );
  return Array.isArray(data) ? data : [];
}

export default fetchCategories;
