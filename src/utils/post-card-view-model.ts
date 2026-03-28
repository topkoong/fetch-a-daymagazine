import { stripHtmlTags } from '@utils/format-content';
import type { PostCardViewModel } from 'types/post-card-view-model';
import type { WpPost } from 'types/wordpress';

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
