import type { PostCardViewModel } from 'types/post-card-view-model';

export function getRelatedPosts(
  currentPost: PostCardViewModel,
  allPosts: PostCardViewModel[],
  maxCount: number = 3,
): PostCardViewModel[] {
  return allPosts
    .filter(
      (post) =>
        post.id !== currentPost.id &&
        post.categoryIds.some((id) => currentPost.categoryIds.includes(id)),
    )
    .slice(0, maxCount);
}
