import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import cachedCategoriesData from '@assets/cached/categories.json';
import cachedMobilePostsData from '@assets/cached/mobile-posts.json';
import cachedPostsData from '@assets/cached/posts.json';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import { useQuery } from '@tanstack/react-query';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
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
const MAX_POSTS_BY_BREAKPOINT = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 8,
} as const;

function buildCategoryFeedSections(
  categories: WpCategory[] | undefined,
  posts: WpPost[] | undefined,
): CategoryFeedSection[] {
  if (!categories?.length || !posts?.length) return [];

  const categoryNameById = new Map<string, string>();
  const postsByCategoryName = new Map<string, WpPostWithResolvedCategories[]>();

  for (const category of categories) {
    if (ASCII_CATEGORY_NAME.test(category.name)) {
      const categoryId = String(category.id);
      categoryNameById.set(categoryId, category.name);
      postsByCategoryName.set(category.name, []);
    }
  }

  for (const post of posts) {
    const resolvedCategoryLabels =
      post.categories
        ?.map((categoryId) => categoryNameById.get(String(categoryId)))
        .filter((label): label is string => Boolean(label)) ?? [];

    if (!resolvedCategoryLabels.length) continue;

    const postWithLabels: WpPostWithResolvedCategories = {
      ...post,
      resolvedCategoryLabels,
    };

    for (const label of resolvedCategoryLabels) {
      const currentPosts = postsByCategoryName.get(label);
      if (currentPosts) currentPosts.push(postWithLabels);
    }
  }

  const sortedPairs = [...categoryNameById.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], 'en'),
  );

  const sections: CategoryFeedSection[] = [];
  for (const [categoryId, displayName] of sortedPairs) {
    const sectionPosts = postsByCategoryName.get(displayName) ?? [];
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
  const { active, isXs, isSm } = useBreakpoints();

  const initialPostsCache: WpPost[] =
    isXs || isSm ? cachedMobilePostsData : cachedPostsData;

  const {
    data: posts,
    error: postsError,
    isPending: postsPending,
  } = useQuery({
    queryKey: queryKeys.allPosts,
    queryFn: fetchPosts,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: DEFAULT_STALE_TIME_MS,
    initialData: initialPostsCache,
    placeholderData: initialPostsCache,
  });

  const {
    data: categories,
    error: categoriesError,
    isPending: categoriesPending,
  } = useQuery({
    queryKey: queryKeys.allCategories,
    queryFn: fetchCategories,
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

  const visiblePostCardCount = MAX_POSTS_BY_BREAKPOINT[active];

  const isLoading = postsPending || categoriesPending;
  const hasError = postsError ?? categoriesError;
  const errorMessage = hasError instanceof Error ? hasError.message : null;

  return (
    <article className='home-page mx-auto w-full max-w-[1600px] px-2 pb-12 sm:px-4'>
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
        <div className='feed-sections px-2 sm:px-4 md:px-6'>
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
