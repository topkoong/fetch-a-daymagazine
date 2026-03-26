import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import { useQuery } from '@tanstack/react-query';
import { lazy } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
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

async function loadCachedPostsData(useMobileCache: boolean): Promise<WpPost[]> {
  const module = useMobileCache
    ? await import('@assets/cached/mobile-posts.json')
    : await import('@assets/cached/posts.json');
  const data = module.default;
  return Array.isArray(data) ? (data as WpPost[]) : [];
}

async function loadCachedCategoriesData(): Promise<WpCategory[]> {
  const module = await import('@assets/cached/categories.json');
  const data = module.default;
  return Array.isArray(data) ? (data as WpCategory[]) : [];
}

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
  const shouldUseMobileCache = isXs || isSm;

  const fetchPostsWithFallback = useCallback(async () => {
    try {
      return await fetchPosts();
    } catch {
      return loadCachedPostsData(shouldUseMobileCache);
    }
  }, [shouldUseMobileCache]);

  const fetchCategoriesWithFallback = useCallback(async () => {
    try {
      return await fetchCategories();
    } catch {
      return loadCachedCategoriesData();
    }
  }, []);

  const {
    data: posts,
    error: postsError,
    isPending: postsPending,
  } = useQuery({
    queryKey: queryKeys.allPosts,
    queryFn: fetchPostsWithFallback,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const {
    data: categories,
    error: categoriesError,
    isPending: categoriesPending,
  } = useQuery({
    queryKey: queryKeys.allCategories,
    queryFn: fetchCategoriesWithFallback,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const cachedPostsById = useMemo(() => {
    const map = new Map<number, WpPost>();
    for (const row of posts ?? []) {
      map.set(row.id, row);
    }
    return map;
  }, [posts]);

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
      <PageHeader
        title='Toppy × a day magazine'
        subtitle='Discover thoughtful stories across culture, work, design, and everyday life — updated from a day magazine with fast browsing and category-first exploration.'
      />
      <section className='mx-auto mt-4 max-w-5xl rounded-2xl border-2 border-black/70 bg-white/85 p-5 shadow-sm sm:p-7'>
        <p className='text-xs font-bold uppercase tracking-[0.14em] text-dull-black/80'>
          Trusted source aggregation
        </p>
        <h2 className='mt-2 text-2xl font-extrabold leading-tight text-dull-black sm:text-3xl'>
          Read the best stories from a day magazine in one fast, mobile-friendly feed.
        </h2>
        <p className='mt-3 text-sm leading-relaxed text-dull-black/80 sm:text-base'>
          Curated categories, optimized cards, and smart pagination help you discover
          meaningful articles without friction.
        </p>
        <div className='mt-5 flex flex-wrap gap-3'>
          <a
            href='#featured-categories'
            className='rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Explore featured categories
          </a>
          <a
            href='https://adaymagazine.com/'
            target='_blank'
            rel='noreferrer'
            className='rounded-md border border-black/70 px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Visit original publisher
          </a>
        </div>
        <ul className='mt-5 grid grid-cols-1 gap-2 text-xs font-semibold uppercase tracking-wide text-dull-black/75 sm:grid-cols-3 sm:text-sm'>
          <li className='rounded-md border border-black/20 bg-white/70 px-3 py-2'>
            Source: adaymagazine.com
          </li>
          <li className='rounded-md border border-black/20 bg-white/70 px-3 py-2'>
            Network-first, cache-resilient
          </li>
          <li className='rounded-md border border-black/20 bg-white/70 px-3 py-2'>
            Accessible and responsive UI
          </li>
        </ul>
      </section>
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
        <div id='featured-categories' className='feed-sections px-2 sm:px-4 md:px-6'>
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
              <ul className='post-grid mt-8 grid grid-cols-1 gap-8 px-1 sm:px-2 md:mt-10 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
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
