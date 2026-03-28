import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import CategoryHeader from '@components/CategoryHeader';
import JsonLd from '@components/JsonLd';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import useSeo from '@hooks/useSeo';
import { useQuery } from '@tanstack/react-query';
import { buildHomeStructuredData } from '@utils/structured-data';
import { useCallback, useMemo } from 'preact/hooks';
import { Link } from 'react-router-dom';
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
const READER_PROMISES = [
  'We prioritize quality over volume so your reading time delivers higher value.',
  'Each section is curated for intent-first exploration, not random endless scroll.',
  'Story details remain available through resilient fallback and structured caching.',
] as const;
const FAQ_ITEMS = [
  {
    question: 'Where do these stories come from?',
    answer:
      'All stories are sourced from a day magazine and presented in a cleaner reading interface.',
  },
  {
    question: 'Why does this feel faster than typical feeds?',
    answer:
      'The interface is optimized for category-first navigation, tighter card hierarchy, and resilient cache behavior.',
  },
  {
    question: 'Can I still open the original source?',
    answer:
      'Yes. Every story detail page includes a direct path to the original article on a day magazine.',
  },
  {
    question: 'What editorial standards does this surface follow?',
    answer:
      'We surface titles, excerpts, and metadata without altering the underlying reporting. The goal is faithful presentation with a calmer layout, not editorial rewrite.',
  },
  {
    question: 'What happens when the network or source is slow?',
    answer:
      'The app tries the live API first, then falls back to bundled cache where available so you can still scan and open many stories.',
  },
] as const;

const EDITORIAL_STANDARD_POINTS = [
  'Headlines and excerpts stay aligned with the source article; we do not fabricate context.',
  'Category groupings follow the publisher taxonomy so intent-based browsing stays honest.',
  'Imagery and attribution flow through the same API fields the editorial team published.',
] as const;

const SOURCE_TRANSPARENCY_POINTS = [
  'Story payloads are retrieved from the public WordPress REST API at adaymagazine.com.',
  'Build and deploy pipelines may refresh JSON snapshots; CI often validates committed files without calling the API.',
  'When you open a story in this app, you can still reach the canonical page on a day magazine in one action.',
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
  useSeo({
    title: 'Home',
    description:
      'Discover curated stories from a day magazine with category-first navigation, refined editorial cards, and a premium reading flow.',
    path: '/',
  });

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
      <JsonLd data={buildHomeStructuredData()} />
      <PageHeader
        title='Toppy × a day magazine'
        subtitle='Discover thoughtful stories across culture, work, design, and everyday life — updated from a day magazine with fast browsing and category-first exploration.'
      />
      <section className='mx-auto mt-5 max-w-5xl rounded-2xl border border-black/15 bg-white/92 p-5 shadow-sm sm:mt-6 sm:p-8'>
        <p className='text-xs font-semibold tracking-[0.1em] text-dull-black/60'>
          Trusted source, cleaner experience
        </p>
        <h2 className='mt-2 text-2xl font-extrabold leading-tight tracking-tight text-dull-black sm:text-3xl md:text-[2rem]'>
          Your high-signal reading dashboard for a day magazine.
        </h2>
        <p className='mt-3 max-w-3xl text-sm leading-relaxed text-dull-black/80 sm:text-base'>
          Skip noisy scrolling. Get a cleaner, faster path to stories worth your time,
          with curated categories and intuitive navigation.
        </p>
        <div
          className='mt-5 flex flex-wrap items-center gap-2.5'
          aria-label='Primary calls to action'
        >
          <a
            href='#featured-categories'
            className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Start reading high-signal stories
          </a>
          <a
            href='https://adaymagazine.com/'
            target='_blank'
            rel='noreferrer'
            className='inline-flex min-h-11 items-center rounded-md border border-black/60 px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Access the source newsroom
          </a>
          <Link
            to='/topics/business'
            className='inline-flex min-h-11 items-center rounded-md border border-black/60 bg-white px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
          >
            Explore business intelligence
          </Link>
        </div>
        <h3 className='mt-8 text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
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
        <h3 className='mt-7 text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
          Social Proof
        </h3>
        <p className='mt-2 text-sm leading-relaxed text-dull-black/80 sm:text-base'>
          Built around stories from the established editorial team at a day magazine, with
          a reading experience optimized for repeat visits.
        </p>
        <h3 className='mt-7 text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
          Key Features
        </h3>
        <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {FEATURE_PILLARS.map((feature) => (
            <article
              key={feature.title}
              className='rounded-md border border-black/12 bg-white/75 px-3 py-3'
            >
              <h4 className='text-sm font-bold tracking-wide text-dull-black'>
                {feature.title}
              </h4>
              <p className='mt-1 text-xs leading-relaxed text-dull-black/80 sm:text-sm'>
                {feature.detail}
              </p>
            </article>
          ))}
        </div>
        <h3 className='mt-7 text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
          Success Indicators
        </h3>
        <ul className='mt-3 grid grid-cols-1 gap-2 text-xs font-semibold tracking-wide text-dull-black/70 sm:grid-cols-3 sm:text-sm'>
          {SUCCESS_INDICATORS.map((indicator) => (
            <li
              key={indicator}
              className='rounded-md border border-black/12 bg-white/75 px-3 py-2'
            >
              {indicator}
            </li>
          ))}
        </ul>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/80 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Content Offer
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-dull-black/80'>
            Pick a category above and start with the top stories. Use “Load more” inside
            each category to keep your reading momentum.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <a
              href='#featured-categories'
              className='inline-flex min-h-10 items-center rounded-md bg-black px-3 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-sm'
            >
              Explore premium collections
            </a>
            <a
              href='https://adaymagazine.com/'
              target='_blank'
              rel='noreferrer'
              className='inline-flex min-h-10 items-center rounded-md border border-black/60 px-3 py-2 text-xs font-semibold tracking-wide text-dull-black transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-sm'
            >
              Open the full source archive
            </a>
          </div>
        </div>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/85 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Reader Promise
          </h3>
          <ul className='mt-2 space-y-2 text-sm leading-relaxed text-dull-black/85'>
            {READER_PROMISES.map((promise) => (
              <li
                key={promise}
                className='rounded-md border border-black/10 bg-white/80 px-3 py-2'
              >
                {promise}
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/85 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Editorial standards
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-dull-black/85'>
            Toppy is a reading layer: typography, spacing, and navigation change; the
            editorial substance remains the work of a day magazine. These standards keep
            the contract with readers explicit.
          </p>
          <ul className='mt-3 space-y-2 text-sm leading-relaxed text-dull-black/85'>
            {EDITORIAL_STANDARD_POINTS.map((point) => (
              <li
                key={point}
                className='rounded-md border border-black/10 bg-white/80 px-3 py-2'
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/85 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Source transparency
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-dull-black/85'>
            Understanding where data comes from matters for trust. Here is how this
            product relates to the publisher.
          </p>
          <ul className='mt-3 space-y-2 text-sm leading-relaxed text-dull-black/85'>
            {SOURCE_TRANSPARENCY_POINTS.map((point) => (
              <li
                key={point}
                className='rounded-md border border-black/10 bg-white/80 px-3 py-2'
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/85 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Reading philosophy
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-dull-black/85'>
            Premium editorial products reward patience. We bias toward category intent,
            legible cards, and predictable navigation so you spend mental energy on
            choosing what to read, not fighting the interface. Cache-aware delivery
            supports that calm pace even when networks waver.
          </p>
        </div>
        <div className='mt-7 rounded-lg border border-black/12 bg-white/85 px-4 py-4'>
          <h3 className='text-sm font-extrabold tracking-wide text-dull-black sm:text-base'>
            Frequently Asked Questions
          </h3>
          <div className='mt-3 space-y-3'>
            {FAQ_ITEMS.map((item) => (
              <article
                key={item.question}
                className='rounded-md border border-black/10 bg-white/80 px-3 py-3'
              >
                <h4 className='text-sm font-bold tracking-wide text-dull-black'>
                  {item.question}
                </h4>
                <p className='mt-1 text-sm leading-relaxed text-dull-black/80'>
                  {item.answer}
                </p>
              </article>
            ))}
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
