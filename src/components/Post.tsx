import placeholderImage from '@assets/images/placeholder.png';
import useIntersectionObserver from '@hooks/useIntersectionObserver';
import { stripHtmlTags } from '@utils/format-content';
import { useMemo, useRef } from 'preact/hooks';
import type { WpImageSize, WpPost } from 'types/wordpress';

export interface PostCardProps {
  post: WpPost;
  /** When true, featured image loads immediately (first home row). */
  prioritizeMedia?: boolean;
  /** Optional cache of posts by id for faster first paint when API payload omits media. */
  cachedPostsById?: ReadonlyMap<number, WpPost>;
}

function pickMediumSize(image: WpPost['featured_image']): WpImageSize | undefined {
  return image?.sizes?.medium;
}

function resolveFeaturedImage(
  post: WpPost,
  cachedPostsById: ReadonlyMap<number, WpPost> | undefined,
): { src: string; width: number; height: number; alt: string } {
  const medium = pickMediumSize(post.featured_image);
  const fromCache =
    !medium?.src && cachedPostsById
      ? pickMediumSize(cachedPostsById.get(post.id)?.featured_image)
      : undefined;
  const chosen = medium?.src ? medium : fromCache;
  const titlePlain = stripHtmlTags(post.title?.rendered ?? '');
  const altFromImage = post.featured_image?.alt?.trim();
  const alt =
    altFromImage ||
    (titlePlain ? `Featured image for: ${titlePlain}` : 'Article featured image');

  if (chosen?.src) {
    return {
      src: chosen.src,
      width: chosen.width,
      height: chosen.height,
      alt,
    };
  }

  return {
    src: placeholderImage,
    width: 300,
    height: 200,
    alt: titlePlain ? `Placeholder for: ${titlePlain}` : 'Article image placeholder',
  };
}

function PostCard({
  post,
  prioritizeMedia = false,
  cachedPostsById,
}: PostCardProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const observerEntry = useIntersectionObserver(imageRef, {});
  const isInView = !!observerEntry?.isIntersecting;

  const shouldDeferThumbnail = !prioritizeMedia && !isInView;

  const image = useMemo(
    () => resolveFeaturedImage(post, cachedPostsById),
    [post, cachedPostsById],
  );

  const displaySrc = shouldDeferThumbnail ? placeholderImage : image.src;
  const headingText = stripHtmlTags(post.title?.rendered ?? '');

  const openArticle = () => {
    window.open(post.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <li className='post-card list-none'>
      <article className='post-card__inner flex h-full flex-col overflow-hidden rounded-lg border-2 border-black bg-bright-yellow shadow-sm transition-shadow duration-300 hover:shadow-md'>
        <header className='post-card__header border-b border-black/10 px-6 pb-4 pt-6'>
          <h2 className='post-title line-clamp-3 min-h-[4.5rem] leading-snug'>
            {headingText}
          </h2>
        </header>
        <div className='post-card__media flex flex-1 justify-center bg-black/5 px-4 py-6'>
          <div
            className='relative w-full max-w-md overflow-hidden rounded-md'
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          >
            <img
              ref={imageRef}
              className={`h-full w-full object-contain transition duration-500 ease-out ${
                shouldDeferThumbnail
                  ? 'scale-105 grayscale blur-sm'
                  : 'scale-100 grayscale-0 blur-0'
              }`}
              src={displaySrc}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={prioritizeMedia ? 'eager' : 'lazy'}
              decoding='async'
            />
          </div>
        </div>
        <footer className='post-card__footer px-6 pb-6 pt-2'>
          <button
            type='button'
            className='btn-primary w-full max-w-xs transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
            onClick={openArticle}
            aria-label={`Open article: ${headingText || 'post'}`}
          >
            <span className='btn-secondary text-lg'>Read article</span>
          </button>
        </footer>
      </article>
    </li>
  );
}

export default PostCard;
