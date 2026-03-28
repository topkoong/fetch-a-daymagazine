import type { PostCardViewModel } from 'types/post-card-view-model';

export function getRelatedPosts(
  currentPost: PostCardViewModel,
  allPosts: PostCardViewModel[],
  maxCount: number = 3,
): PostCardViewModel[] {
  const filtered = allPosts.filter(
    (post) =>
      post.id !== currentPost.id &&
      post.categoryIds.some((id) => currentPost.categoryIds.includes(id)),
  );
  filtered.sort((a, b) => {
    const tb = new Date(b.date ?? 0).getTime();
    const ta = new Date(a.date ?? 0).getTime();
    return tb - ta;
  });
  return filtered.slice(0, maxCount);
}
