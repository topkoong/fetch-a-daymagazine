import type { PostCardViewModel } from 'types/post-card-view-model';

/**
 * Picks a small set of “related” posts for the article reader.
 *
 * **Matching rule:** A post is related if it shares at least one WordPress category id
 * (`categoryIds`) with the current article. That mirrors how editorial desks group stories
 * in the source CMS.
 *
 * **Ordering:** Candidates are sorted by `date` descending (newest first). When many posts
 * share a category, feed/API order is arbitrary; sorting makes the strip predictable for readers
 * and QA.
 *
 * **Limit:** Only the first `maxCount` items after sort are returned (default 3). Increase
 * with care—layout is tuned for a compact row.
 *
 * @param currentPost - The article being viewed (excluded from results by id).
 * @param allPosts - Same pool the home feed uses (live API or bundled JSON via TanStack cache).
 * @param maxCount - Maximum related cards to show (default 3).
 */
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
