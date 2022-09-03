import { A_DAY_CATEGORIES_ENDPOINT } from '@constants/index';
import axios from 'axios';

const fetchCategories = async (): Promise<any> => {
  const { data } = await axios.get(`${A_DAY_CATEGORIES_ENDPOINT}?per_page=60`);
  return data;
};

export default fetchCategories;
