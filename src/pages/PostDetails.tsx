import { fetchMagazinePostsWithFallback } from '@apis/magazine-feed';
import { fetchPostById } from '@apis/posts';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import { RelatedArticles } from '@components/RelatedArticles';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import { queryKeys } from '@constants/query-keys';
import { getPrimaryTopicLandingForPost } from '@constants/topic-landings';
import useBreakpoints from '@hooks/useBreakpoints';
import useSeo from '@hooks/useSeo';
import { useQuery } from '@tanstack/react-query';
import { sanitizeArticleBodyHtml, stripHtmlTags } from '@utils/format-content';
import { toPostCardViewModel } from '@utils/post-card-view-model';
import { getRelatedPosts } from '@utils/related-posts';
import { Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { Link, useLocation, useParams } from 'react-router-dom';

interface PostDetailsRouteState {
  sourceUrl?: string;
  title?: string;
}

/**
 * Single-article reader: loads one post by id, reuses the **same magazine list query** as Home
 * (`queryKeys.allPosts`) to compute related cards without a second bespoke endpoint.
 */
function PostDetails() {
  const { id: postId } = useParams();
  const location = useLocation();
  const routeState = location.state as PostDetailsRouteState | null;
  const hasValidPostId = typeof postId === 'string' && /^\d+$/.test(postId);
  const { isXs, isSm } = useBreakpoints();
  const shouldUseMobileCache = isXs || isSm;

  // Detail query: independent key so invalidating the list does not drop the open article mid-read.
  const { data, isPending, isError, error } = useQuery({
    queryKey: [...queryKeys.allPosts, 'detail', postId ?? ''],
    queryFn: () => fetchPostById(postId ?? ''),
    enabled: hasValidPostId,
  });

  // Feed query: shares cache with Home when keys match (same `queryKeys.allPosts` + mobile flag).
  // That pool is mapped to `PostCardViewModel` and passed through `getRelatedPosts` (category overlap, date sort).
  const { data: feedPosts } = useQuery({
    queryKey: queryKeys.allPosts,
    queryFn: () => fetchMagazinePostsWithFallback(shouldUseMobileCache),
    staleTime: DEFAULT_STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL,
  });

  const relatedCards = useMemo(() => {
    if (!data || !feedPosts?.length) return [];
    const currentVm = toPostCardViewModel(data, null);
    const allVms = feedPosts.map((p) => toPostCardViewModel(p, null));
    // Excludes current id, keeps posts that share a category id, newest first, max 3 (see `getRelatedPosts`).
    return getRelatedPosts(currentVm, allVms, 3);
  }, [data, feedPosts]);

  const errorMessage = error instanceof Error ? error.message : null;
  const pageTitle = stripHtmlTags(
    data?.title?.rendered ?? routeState?.title ?? 'Article',
  );
  const sourceUrl = data?.link ?? routeState?.sourceUrl ?? null;
  const rawArticleHtml = data?.content?.rendered ?? '';
  const articleHtml = sanitizeArticleBodyHtml(rawArticleHtml).trim();
  const articlePlain = stripHtmlTags(rawArticleHtml).trim();
  const excerpt = stripHtmlTags(data?.excerpt?.rendered ?? '').trim();
  const description = excerpt || articlePlain.slice(0, 180);
  const storyImage =
    data?.featured_image?.sizes?.medium?.src ??
    data?.featured_image?.sizes?.full?.src ??
    undefined;
  const imageSize =
    data?.featured_image?.sizes?.medium?.src && data.featured_image.sizes.medium
      ? data.featured_image.sizes.medium
      : data?.featured_image?.sizes?.full;
  const imageAlt =
    data?.featured_image?.alt?.trim() ||
    (pageTitle ? `Featured image: ${pageTitle}` : undefined);

  const topicHub = data ? getPrimaryTopicLandingForPost(data) : null;
  const shareKeywords = useMemo(() => {
    if (!data) return ['article', 'story', 'editorial', 'a day magazine'] as string[];
    const labels = data.categories
      .map((cid) => PRIMARY_NAV_CATEGORIES[String(cid)])
      .filter((label): label is string => Boolean(label));
    const merged = new Set<string>([
      ...labels,
      ...(topicHub?.keywords ?? []),
      'a day magazine',
      'editorial',
      'article',
    ]);
    return [...merged];
  }, [data, topicHub?.keywords]);

  const articleSection =
    topicHub?.title ??
    data?.categories
      .map((cid) => PRIMARY_NAV_CATEGORIES[String(cid)])
      .filter(Boolean)
      .at(0);

  useSeo({
    title: pageTitle,
    description:
      description ||
      'Read the full article in a focused layout, with source-backed content and minimal visual distraction.',
    path: `/posts/${postId ?? ''}`,
    imageUrl: storyImage,
    imageAlt,
    imageWidth: imageSize?.width,
    imageHeight: imageSize?.height,
    keywords: shareKeywords,
    type: 'article',
    publishedTime: data?.date,
    modifiedTime: data?.modified,
    articleSection,
  });

  return (
    <article className='mx-auto min-h-[50vh] w-full max-w-4xl bg-brand-white px-4 py-8 sm:px-6'>
      <PageHeader
        title={pageTitle}
        subtitle='Experience the full story in a focused editorial layout sourced from a day magazine.'
      />
      <PageBreak />

      {!hasValidPostId ? (
        <div
          className='mt-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'
          role='alert'
        >
          <p className='font-semibold'>Invalid article route</p>
          <p className='text-sm'>The article id is missing or invalid.</p>
        </div>
      ) : isPending ? (
        <div className='mt-10 flex min-h-[30vh] items-center justify-center'>
          <Spinner label='Loading article details' />
        </div>
      ) : isError ? (
        <div
          className='mt-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'
          role='alert'
        >
          <p className='font-semibold'>Could not load this article</p>
          <p className='text-sm'>{errorMessage ?? 'Please try again in a moment.'}</p>
        </div>
      ) : (
        <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-4 shadow-sm sm:p-6'>
          {storyImage ? (
            <figure className='mb-6 overflow-hidden rounded-lg border border-black/10 bg-black/5'>
              <img
                src={storyImage}
                alt={imageAlt ?? ''}
                width={imageSize?.width}
                height={imageSize?.height}
                className='max-h-[min(70vh,32rem)] w-full object-cover'
              />
            </figure>
          ) : null}
          {articleHtml ? (
            <Fragment>
              {/* eslint-disable react/no-danger -- sanitized WordPress article HTML */}
              <div
                className='article-body max-w-none text-sm leading-7 text-dull-black/90 sm:text-base [&_a]:text-black [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_figure]:my-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_p]:my-4 [&_p]:first:mt-0'
                dangerouslySetInnerHTML={{ __html: articleHtml }}
              />
              {/* eslint-enable react/no-danger */}
            </Fragment>
          ) : (
            <p className='rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm text-dull-black/80'>
              No article body is currently available from the source feed.
            </p>
          )}
          {/* Related strip: `relatedCards` is pre-filtered/sorted in `useMemo`; this component only renders links. */}
          {data ? <RelatedArticles posts={relatedCards} currentPostId={data.id} /> : null}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
            {topicHub ? (
              <Link
                to={`/topics/${topicHub.slug}`}
                className='inline-flex rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
              >
                Continue in the {topicHub.title} hub
              </Link>
            ) : null}
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex rounded-md border border-black/70 px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
              >
                Open the original source article
              </a>
            ) : null}
          </div>
        </section>
      )}
    </article>
  );
}

export default PostDetails;
