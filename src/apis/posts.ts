import { A_DAY_POSTS_ENDPOINT } from '@constants/index';
import axios from 'axios';

const fetchPosts = async (): Promise<any> => {
  const { data } = await axios.get(`${A_DAY_POSTS_ENDPOINT}?per_page=60`);
  return data;
};

export default fetchPosts;
