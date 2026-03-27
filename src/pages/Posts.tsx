import { fetchCategoryPostsPage } from '@apis/posts';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useSeo from '@hooks/useSeo';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useLocation, useParams } from 'react-router-dom';
import type { WpPost } from 'types/wordpress';

interface CategoryRouteState {
  category?: string;
}

const BASE_VISIBLE_POST_COUNT = 8;

function Posts() {
  const { id: categoryId } = useParams();
  const location = useLocation();
  const routeState = location.state as CategoryRouteState | null;
  const categoryTitle = routeState?.category ?? 'Category';
  useSeo({
    title: `${categoryTitle} stories`,
    description: `Read curated ${categoryTitle.toLowerCase()} stories from a day magazine with fast load-more browsing.`,
    path: `/posts/categories/${categoryId ?? ''}`,
  });
  const hasValidCategoryId = typeof categoryId === 'string' && categoryId.length > 0;
  const savedVisibleCountKey = hasValidCategoryId
    ? `category-visible-count-${categoryId}`
    : null;

  const queryKey = useMemo(
    () =>
      hasValidCategoryId
        ? queryKeys.categoryPosts(categoryId)
        : (['posts', 'category', ''] as const),
    [categoryId, hasValidCategoryId],
  );

  const {
    data,
    error,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchCategoryPostsPage(categoryId ?? '', pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.nextOffset;
    },
    enabled: hasValidCategoryId,
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
  });

  const [desiredVisibleCount, setDesiredVisibleCount] = useState<number>(() => {
    if (typeof window === 'undefined' || !savedVisibleCountKey) {
      return BASE_VISIBLE_POST_COUNT;
    }
    const parsed = Number(window.sessionStorage.getItem(savedVisibleCountKey));
    return Number.isFinite(parsed) && parsed > BASE_VISIBLE_POST_COUNT
      ? parsed
      : BASE_VISIBLE_POST_COUNT;
  });

  const flattenedPosts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? ([] as WpPost[]),
    [data?.pages],
  );

  useEffect(() => {
    if (!savedVisibleCountKey) return;
    window.sessionStorage.setItem(savedVisibleCountKey, String(desiredVisibleCount));
  }, [desiredVisibleCount, savedVisibleCountKey]);

  useEffect(() => {
    if (!savedVisibleCountKey) return;
    const parsed = Number(window.sessionStorage.getItem(savedVisibleCountKey));
    if (Number.isFinite(parsed) && parsed > BASE_VISIBLE_POST_COUNT) {
      setDesiredVisibleCount(parsed);
      return;
    }
    setDesiredVisibleCount(BASE_VISIBLE_POST_COUNT);
  }, [savedVisibleCountKey]);

  useEffect(() => {
    if (!hasValidCategoryId) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    if (flattenedPosts.length >= desiredVisibleCount) return;
    void fetchNextPage();
  }, [
    desiredVisibleCount,
    fetchNextPage,
    flattenedPosts.length,
    hasNextPage,
    hasValidCategoryId,
    isFetchingNextPage,
  ]);

  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <article className='category-posts-page mx-auto w-full max-w-[1600px] py-8'>
      <PageHeader
        title={categoryTitle}
        subtitle='Browse editor-curated articles in this category and load more stories as you go.'
      />
      <PageBreak />
      {!hasValidCategoryId ? (
        <div
          className='error-banner mx-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'
          role='alert'
        >
          <p className='font-semibold'>Invalid category route</p>
          <p className='text-sm'>The category id is missing in the URL.</p>
        </div>
      ) : isPending ? (
        <div
          className='spinner-container min-h-[40vh]'
          role='status'
          aria-live='polite'
          aria-busy
        >
          <Spinner label='Loading posts' />
        </div>
      ) : isError && errorMessage ? (
        <div
          className='error-banner mx-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'
          role='alert'
        >
          <p className='font-semibold'>Could not load posts</p>
          <p className='text-sm'>{errorMessage}</p>
        </div>
      ) : (
        <Fragment>
          <ul className='post-grid grid grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
            {flattenedPosts.map((post) => (
              <Post key={post.id} post={post} prioritizeMedia={false} />
            ))}
          </ul>
          <div className='mt-12 flex flex-col items-center gap-4 px-6'>
            {isFetchingNextPage ? (
              <div role='status' aria-live='polite' aria-busy>
                <Spinner label='Loading more posts' />
              </div>
            ) : hasNextPage ? (
              <button
                type='button'
                className='btn-primary min-w-[12rem] transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60'
                onClick={() => {
                  setDesiredVisibleCount((prev) => prev + BASE_VISIBLE_POST_COUNT);
                  void fetchNextPage();
                }}
                disabled={isFetchingNextPage}
              >
                <span className='btn-secondary text-lg'>
                  Reveal 8 more standout stories
                </span>
              </button>
            ) : flattenedPosts.length > 0 ? (
              <p className='end-of-feed text-center text-sm font-semibold uppercase tracking-wide text-dull-black'>
                You have reached the end of this category
              </p>
            ) : (
              <p className='empty-feed text-center text-dull-black'>
                No posts in this category yet.
              </p>
            )}
          </div>
        </Fragment>
      )}
    </article>
  );
}

export default Posts;
