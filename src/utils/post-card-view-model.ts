import { stripHtmlTags } from '@utils/format-content';
import type { PostCardViewModel } from 'types/post-card-view-model';
import type { WpPost } from 'types/wordpress';

/**
 * Maps a raw `WpPost` from the API/cache into a **card-safe view model** (plain strings, no HTML).
 *
 * Used by:
 * - **FeaturedArticle** / marketing surfaces that need a stable title, excerpt, and image URL.
 * - **RelatedArticles**, after building the list from the same `WpPost[]` as the feed.
 *
 * All `rendered` HTML fields are passed through `stripHtmlTags`, which also decodes common
 * HTML entities so typographic quotes display correctly in the UI.
 *
 * @param post - Normalized WordPress post from `normalizeWpPost` / list endpoints.
 * @param categoryLabel - Optional primary desk label (e.g. ASCII category name); pass `null` when
 *   not resolved—related cards often omit this.
 */
export function toPostCardViewModel(
  post: WpPost,
  categoryLabel: string | null = null,
): PostCardViewModel {
  const sizes = post.featured_image?.sizes;
  const imageUrl = sizes?.medium?.src ?? sizes?.full?.src ?? null;
  return {
    id: post.id,
    title: stripHtmlTags(post.title.rendered),
    excerpt: stripHtmlTags(post.excerpt?.rendered ?? ''),
    date: post.date,
    imageUrl,
    categoryIds: post.categories,
    categoryLabel,
    link: post.link,
  };
}
