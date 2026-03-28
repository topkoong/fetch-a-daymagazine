import fetchCategories from '@apis/categories';
import { fetchMagazinePostsWithFallback } from '@apis/magazine-feed';
import ArticleFeed from '@components/ArticleFeed';
import CategoryChips from '@components/CategoryChips';
import { FeaturedArticle } from '@components/FeaturedArticle';
import JsonLd from '@components/JsonLd';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS, REFETCH_INTERVAL } from '@constants/index';
import { queryKeys } from '@constants/query-keys';
import useBreakpoints from '@hooks/useBreakpoints';
import useSeo from '@hooks/useSeo';
import { useQuery } from '@tanstack/react-query';
import { toPostCardViewModel } from '@utils/post-card-view-model';
import { buildHomeStructuredData } from '@utils/structured-data';
import { Fragment } from 'preact';
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

function getPrimaryAsciiCategoryLabel(
  post: WpPost,
  categories: WpCategory[] | undefined,
): string | null {
  if (!categories?.length) return null;
  const nameById = new Map<string, string>();
  for (const c of categories) {
    if (ASCII_CATEGORY_NAME.test(c.name)) {
      nameById.set(String(c.id), c.name);
    }
  }
  for (const cid of post.categories) {
    const name = nameById.get(String(cid));
    if (name) return name;
  }
  return null;
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
    return fetchMagazinePostsWithFallback(shouldUseMobileCache);
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

  const sortedPosts = useMemo(() => {
    const list = [...(posts ?? [])];
    list.sort((a, b) => {
      const tb = new Date(b.date ?? 0).getTime();
      const ta = new Date(a.date ?? 0).getTime();
      return tb - ta;
    });
    return list;
  }, [posts]);

  const featuredPost = sortedPosts[0];
  const postsForFeed = sortedPosts.slice(1);

  const featuredViewModel = useMemo(() => {
    if (!featuredPost) return null;
    return toPostCardViewModel(
      featuredPost,
      getPrimaryAsciiCategoryLabel(featuredPost, categories),
    );
  }, [featuredPost, categories]);

  const cachedPostsById = useMemo(() => {
    const map = new Map<number, WpPost>();
    for (const row of posts ?? []) {
      map.set(row.id, row);
    }
    return map;
  }, [posts]);

  const categoryFeedSections = useMemo(
    () => buildCategoryFeedSections(categories, postsForFeed),
    [categories, postsForFeed],
  );

  const visiblePostCardCount = MAX_POSTS_BY_BREAKPOINT[active];

  const isLoading = postsPending || categoriesPending;
  const hasError = postsError ?? categoriesError;
  const errorMessage = hasError instanceof Error ? hasError.message : null;

  return (
    <article className='home-page mx-auto w-full max-w-[1600px] overflow-x-hidden px-3 pb-12 sm:px-4'>
      <JsonLd data={buildHomeStructuredData()} />
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
      ) : featuredViewModel ? (
        <Fragment>
          <div className='px-1 sm:px-3 md:px-5'>
            <FeaturedArticle post={featuredViewModel} />
          </div>
          <div className='mt-10'>
            <CategoryChips />
          </div>
          <ArticleFeed
            sections={categoryFeedSections}
            visiblePostCardCount={visiblePostCardCount}
            cachedPostsById={cachedPostsById}
          />
        </Fragment>
      ) : (
        <p className='px-4 py-8 text-center text-sm text-dull-black'>
          No stories available right now.
        </p>
      )}
    </article>
  );
}

export default Home;
