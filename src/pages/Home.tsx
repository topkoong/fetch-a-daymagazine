import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import cachedCategoriesData from '@assets/cached/categories.json';
import cachedMobilePostsData from '@assets/cached/mobile-posts.json';
import cachedPostsData from '@assets/cached/posts.json';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';
import type {
  CategoryFeedSection,
  WpCategory,
  WpPost,
  WpPostWithResolvedCategories,
} from 'types/wordpress';

const PageBreak = lazy(() => import('@components/PageBreak'));
const PageHeader = lazy(() => import('@components/PageHeader'));
const Post = lazy(() => import('@components/Post'));
const Spinner = lazy(() => import('@components/Spinner'));
const CategoryHeader = lazy(() => import('@components/CategoryHeader'));

const ASCII_CATEGORY_NAME = /^[A-Za-z0-9]+$/;

function buildCategoryFeedSections(
  categories: WpCategory[] | undefined,
  posts: WpPost[] | undefined,
): CategoryFeedSection[] {
  if (!categories?.length || !posts?.length) return [];

  const asciiCategoryIdToName = new Map<string, string>();
  for (const category of categories) {
    if (ASCII_CATEGORY_NAME.test(category.name)) {
      asciiCategoryIdToName.set(String(category.id), category.name);
    }
  }

  const postsWithLabels: WpPostWithResolvedCategories[] = posts.map((post) => {
    const resolvedCategoryLabels =
      post.categories
        ?.map((categoryId) => asciiCategoryIdToName.get(String(categoryId)))
        .filter((label): label is string => Boolean(label)) ?? [];
    return { ...post, resolvedCategoryLabels };
  });

  const postsInFeed = postsWithLabels.filter(
    (post) => post.resolvedCategoryLabels.length > 0,
  );

  const sortedPairs = [...asciiCategoryIdToName.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], 'en'),
  );

  const sections: CategoryFeedSection[] = [];
  for (const [categoryId, displayName] of sortedPairs) {
    const sectionPosts = postsInFeed.filter((post) =>
      post.resolvedCategoryLabels.includes(displayName),
    );
    if (sectionPosts.length > 0) {
      sections.push({
        categoryId,
        displayName,
        posts: sectionPosts,
      });
    }
  }
  return sections;
}

function Home() {
  const { isXs, isSm, isMd, isLg, isXl } = useBreakpoints();

  const initialPostsCache = isXs || isSm ? cachedMobilePostsData : cachedPostsData;

  const {
    data: posts,
    error: postsError,
    status: postsStatus,
  } = useQuery(queryKeys.allPosts, fetchPosts, {
    refetchInterval: REFETCH_INTERVAL,
    staleTime: DEFAULT_STALE_TIME_MS,
    initialData: initialPostsCache as WpPost[],
    placeholderData: initialPostsCache as WpPost[],
  });

  const {
    data: categories,
    error: categoriesError,
    status: categoriesStatus,
  } = useQuery(queryKeys.allCategories, fetchCategories, {
    refetchInterval: REFETCH_INTERVAL,
    staleTime: DEFAULT_STALE_TIME_MS,
    initialData: cachedCategoriesData as WpCategory[],
    placeholderData: cachedCategoriesData as WpCategory[],
  });

  const cachedPostsById = useMemo(() => {
    const map = new Map<number, WpPost>();
    for (const row of cachedPostsData as WpPost[]) {
      map.set(row.id, row);
    }
    for (const row of cachedMobilePostsData as WpPost[]) {
      map.set(row.id, row);
    }
    return map;
  }, []);

  const categoryFeedSections = useMemo(
    () => buildCategoryFeedSections(categories, posts),
    [categories, posts],
  );

  const visiblePostCardCount = useMemo(() => {
    if (isXs || isSm) return 1;
    if (isMd) return 2;
    if (isLg) return 3;
    if (isXl) return 4;
    return 8;
  }, [isLg, isMd, isSm, isXl, isXs]);

  const isLoading = postsStatus === 'loading' || categoriesStatus === 'loading';
  const hasError = postsError ?? categoriesError;
  const errorMessage = hasError instanceof Error ? hasError.message : null;

  return (
    <article className='home-page mx-auto w-full max-w-[1600px] pb-12'>
      <PageHeader title='Toppy × a day magazine' />
      {isLoading ? (
        <div
          className='spinner-container min-h-[40vh]'
          role='status'
          aria-live='polite'
          aria-busy
        >
          <Spinner label='Loading magazine feed' />
        </div>
      ) : errorMessage ? (
        <div
          className='error-banner mx-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'
          role='alert'
        >
          <p className='font-semibold'>Something went wrong</p>
          <p className='text-sm'>{errorMessage}</p>
        </div>
      ) : (
        <div className='feed-sections px-4 sm:px-6'>
          {categoryFeedSections.map((section, sectionIndex) => (
            <section
              key={section.categoryId}
              className='feed-section mb-20 scroll-mt-4'
              aria-labelledby={`category-heading-${section.categoryId}`}
            >
              <CategoryHeader
                categoryId={section.categoryId}
                title={section.displayName}
              />
              <PageBreak />
              <ul className='post-grid mt-10 grid grid-cols-1 gap-8 px-2 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
                {section.posts.slice(0, visiblePostCardCount).map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    prioritizeMedia={sectionIndex === 0}
                    cachedPostsById={cachedPostsById}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}

export default Home;
