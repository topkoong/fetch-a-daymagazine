import { fetchCategoryPostsPage } from '@apis/posts';
import { PAGE_SIZE, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import type { WpPost } from 'types/wordpress';
import { Fragment } from 'preact';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';

interface CategoryRouteState {
  category?: string;
}

const PageBreak = lazy(() => import('@components/PageBreak'));
const PageHeader = lazy(() => import('@components/PageHeader'));
const Post = lazy(() => import('@components/Post'));
const Spinner = lazy(() => import('@components/Spinner'));

function Posts() {
  const { id: categoryId } = useParams();
  const location = useLocation();
  const routeState = location.state as CategoryRouteState | null;
  const categoryTitle = routeState?.category ?? 'Category';

  const queryKey = useMemo(
    () => (categoryId ? queryKeys.categoryPosts(categoryId) : ['categoryPosts', '']),
    [categoryId],
  );

  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    queryKey,
    ({ pageParam = 0 }) =>
      fetchCategoryPostsPage(categoryId as string, pageParam as number),
    {
      enabled: Boolean(categoryId),
      getNextPageParam: (lastPage, allPages) => {
        const batchSize = lastPage.posts.length;
        if (batchSize < PAGE_SIZE) return undefined;
        return allPages.reduce((sum, page) => sum + page.posts.length, 0);
      },
      staleTime: REFETCH_INTERVAL,
      refetchInterval: REFETCH_INTERVAL,
    },
  );

  const flattenedPosts = useMemo(
    () =>
      data?.pages.flatMap((page) => page.posts) ?? ([] as WpPost[]),
    [data?.pages],
  );

  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <article className='category-posts-page mx-auto w-full max-w-[1600px] py-8'>
      <PageHeader title={categoryTitle} />
      <PageBreak />
      {isLoading ? (
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
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                <span className='btn-secondary text-lg'>Load more</span>
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
