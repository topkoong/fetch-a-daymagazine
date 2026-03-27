import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import CategoryHeader from '@components/CategoryHeader';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'preact/hooks';
import type {
  CategoryFeedSection,
  WpCategory,
  WpPost,
  WpPostWithResolvedCategories,
} from 'types/wordpress';

const ASCII_CATEGORY_NAME = /^[A-Za-z0-9]+$/;
const MAX_POSTS_BY_BREAKPOINT = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 8,
} as const;
const BENEFIT_POINTS = [
  'Category-first discovery so you can jump straight to what matters.',
  'Network-first delivery with cache fallback for reliable reading.',
  'Responsive card layout designed for mobile, tablet, and desktop sessions.',
] as const;
const FEATURE_PILLARS = [
  {
    title: 'Editorial Focus',
    detail: 'Culture, business, design, and life coverage from a trusted source.',
  },
  {
    title: 'Fast Navigation',
    detail: 'Primary categories stay accessible at the top for one-tap routing.',
  },
  {
    title: 'Readable Cards',
    detail: 'Clear title, excerpt, date, and CTA to help decision-making quickly.',
  },
] as const;
const SUCCESS_INDICATORS = [
  'Verified source: adaymagazine.com',
  'Fast loading experience',
  'Mobile-first layout',
] as const;

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
    <article className='home-page mx-auto w-full max-w-[1600px] px-3 pb-12 sm:px-4'>
      <PageHeader
        title='Toppy × a day magazine'
        subtitle='Discover thoughtful stories across culture, work, design, and everyday life — updated from a day magazine with fast browsing and category-first exploration.'
      />
      <section className='mx-auto mt-5 max-w-5xl rounded-2xl border border-black/20 bg-white/90 p-5 shadow-sm sm:mt-6 sm:p-7'>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-dull-black/70'>
          Headline
        </p>
        <h2 className='mt-2 text-2xl font-extrabold leading-tight tracking-tight text-dull-black sm:text-3xl'>
          Your high-signal reading dashboard for a day magazine.
        </h2>
        <p className='mt-3 max-w-3xl text-sm leading-relaxed text-dull-black/80 sm:text-base'>
          Skip noisy scrolling. Get a cleaner, faster path to stories worth your time,
          with curated categories and intuitive navigation.
        </p>
        <div className='mt-5 flex flex-wrap gap-2.5' aria-label='Primary calls to action'>
          <a
            href='#featured-categories'
            className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Start reading now
          </a>
          <a
            href='https://adaymagazine.com/'
            target='_blank'
            rel='noreferrer'
            className='inline-flex min-h-11 items-center rounded-md border border-black/60 px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Browse the original publisher
          </a>
        </div>
        <h3 className='mt-6 text-base font-extrabold uppercase tracking-wide text-dull-black sm:text-lg'>
          Benefits
        </h3>
        <ul className='mt-3 space-y-2 text-sm leading-relaxed text-dull-black/85 sm:text-base'>
          {BENEFIT_POINTS.map((benefit) => (
            <li
              key={benefit}
              className='rounded-md border border-black/10 bg-white/70 px-3 py-2'
            >
              {benefit}
            </li>
          ))}
        </ul>
        <h3 className='mt-6 text-base font-extrabold uppercase tracking-wide text-dull-black sm:text-lg'>
          Social proof
        </h3>
        <p className='mt-2 text-sm text-dull-black/80 sm:text-base'>
          Built around stories from the established editorial team at a day magazine, with
          a reading experience optimized for repeat visits.
        </p>
        <h3 className='mt-6 text-base font-extrabold uppercase tracking-wide text-dull-black sm:text-lg'>
          Features
        </h3>
        <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3'>
          {FEATURE_PILLARS.map((feature) => (
            <article
              key={feature.title}
              className='rounded-md border border-black/15 bg-white/70 px-3 py-3'
            >
              <h4 className='text-sm font-bold uppercase tracking-wide text-dull-black'>
                {feature.title}
              </h4>
              <p className='mt-1 text-xs leading-relaxed text-dull-black/80 sm:text-sm'>
                {feature.detail}
              </p>
            </article>
          ))}
        </div>
        <h3 className='mt-6 text-base font-extrabold uppercase tracking-wide text-dull-black sm:text-lg'>
          Success indicators
        </h3>
        <ul className='mt-3 grid grid-cols-1 gap-2 text-xs font-semibold uppercase tracking-wide text-dull-black/70 sm:grid-cols-3 sm:text-sm'>
          {SUCCESS_INDICATORS.map((indicator) => (
            <li
              key={indicator}
              className='rounded-md border border-black/15 bg-white/70 px-3 py-2'
            >
              {indicator}
            </li>
          ))}
        </ul>
        <div className='mt-6 rounded-lg border border-black/15 bg-white/75 px-4 py-3'>
          <h3 className='text-sm font-extrabold uppercase tracking-wide text-dull-black sm:text-base'>
            Content offer
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-dull-black/80'>
            Pick a category above and start with the top stories. Use “Load more” inside
            each category to keep your reading momentum.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <a
              href='#featured-categories'
              className='rounded-md bg-black px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-sm'
            >
              Explore categories
            </a>
            <a
              href='https://adaymagazine.com/'
              target='_blank'
              rel='noreferrer'
              className='rounded-md border border-black/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-sm'
            >
              Secondary CTA: source archive
            </a>
          </div>
        </div>
      </section>
      {isLoading ? (
        <div
          className='spinner-container min-h-[50vh]'
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
        <div id='featured-categories' className='feed-sections px-1 sm:px-3 md:px-5'>
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
