import { A_DAY_POSTS_ENDPOINT, PAGE_SIZE } from '@constants/index';
import axios from 'axios';
import { lazy } from 'preact/compat';
import { useState } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';

interface LinkState {
  category: string;
}

const PageBreak = lazy(() => import('@components/PageBreak'));
const PageHeader = lazy(() => import('@components/PageHeader'));
const Post = lazy(() => import('@components/Post'));
const Spinner = lazy(() => import('@components/Spinner'));

function Posts() {
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const { id } = useParams();
  const location = useLocation();
  const { category }: LinkState = location.state as LinkState;
  const fetchPostsWithPagination = async ({
    pageParam = `${A_DAY_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
  }) => {
    try {
      setCurrentOffset((prevOffSet) => prevOffSet + PAGE_SIZE);
      const { data } = await axios.get(pageParam);
      return { posts: data, nextCursor: currentOffset };
    } catch (err) {
      console.error(err);
    }
  };
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      `posts-from-category-${id}`,
      ({
        pageParam = `${A_DAY_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
      }) => fetchPostsWithPagination(pageParam),
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      },
    );

  return (
    <article className='w-full h-full py-8'>
      <PageHeader title={category} />
      <PageBreak />
      {isLoading ? (
        <div className='spinner-container'>
          <Spinner />
        </div>
      ) : (
        <>
          <ul className='grid grid-cols-1 gap-12 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 h-full'>
            {data?.pages?.map((page: any) =>
              page?.posts.map((post: any) => <Post key={post.id} post={post} />),
            )}
          </ul>
          <div className='text-center mt-8 z-10'>
            {isFetchingNextPage ? (
              <div className='spinner-container'>
                <Spinner />
              </div>
            ) : hasNextPage ? (
              <button
                className='btn-primary'
                onClick={() =>
                  fetchNextPage({
                    pageParam: `${A_DAY_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
                  })
                }
                disabled={!hasNextPage || isFetchingNextPage}
              >
                <span className='btn-secondary'>Load more</span>
              </button>
            ) : (
              <h1 className='btn-terinary'>Nothing more to load</h1>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default Posts;
