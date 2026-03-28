import type { PostCardViewModel } from '../../types';

export interface RelatedArticlesProps {
  /** Already filtered to related posts, max 3. */
  posts: PostCardViewModel[];
  currentPostId: number;
}
