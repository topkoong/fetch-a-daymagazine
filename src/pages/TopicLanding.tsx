/**
 * **Topic hubs** (`/topics/:slug`) are **curated groupings** defined in `topic-landings.ts`: each
 * maps a slug to a set of WordPress **category ids**. Posts are loaded with the same `fetchPosts()`
 * home feed call, then filtered client-side (max {@link MAX_TOPIC_POSTS}). On failure, the query
 * falls back to bundled `posts.json`—same pattern as category pages.
 *
 * Unknown slugs render a picker of all configured topics instead of a hard 404 body.
 */
import fetchPosts from '@apis/posts';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { getTopicBySlug, TOPIC_LANDINGS } from '@constants/topic-landings';
import useSeo from '@hooks/useSeo';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'preact/hooks';
import { Link, useParams } from 'react-router-dom';
import type { WpPost } from 'types/wordpress';

/** Cap grid length so topic pages stay fast even if the feed is huge. */
const MAX_TOPIC_POSTS = 24;

async function loadCachedPostsData(): Promise<WpPost[]> {
  const module = await import('@assets/cached/posts.json');
  const data = module.default;
  return Array.isArray(data) ? (data as WpPost[]) : [];
}

function TopicLanding() {
  const { slug } = useParams();
  const topic = getTopicBySlug(slug);

  const { data, isPending, error } = useQuery({
    queryKey: ['posts', 'topic', slug ?? 'unknown'],
    queryFn: async () => {
      try {
        return await fetchPosts();
      } catch {
        return loadCachedPostsData();
      }
    },
    enabled: Boolean(topic),
  });

  const filteredPosts = useMemo(() => {
    if (!topic || !data?.length) return [] as WpPost[];
    const allowed = new Set(topic.categoryIds);
    return data
      .filter((post) => post.categories.some((id) => allowed.has(id)))
      .slice(0, MAX_TOPIC_POSTS);
  }, [data, topic]);

  const cachedPostsById = useMemo(() => {
    const map = new Map<number, WpPost>();
    for (const row of data ?? []) map.set(row.id, row);
    return map;
  }, [data]);

  useSeo({
    title: topic?.title ?? 'Topic',
    description:
      topic?.description ??
      'Curated topic stories from a day magazine with a premium reading experience.',
    path: `/topics/${slug ?? ''}`,
    keywords: topic?.keywords,
  });

  if (!topic) {
    return (
      <article className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
        <PageHeader
          title='Topic not found'
          subtitle='This topic page does not exist yet. Explore available topic collections below.'
        />
        <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {TOPIC_LANDINGS.map((entry) => (
            <Link
              key={entry.slug}
              to={`/topics/${entry.slug}`}
              className='rounded-lg border border-black/15 bg-white/90 px-4 py-3 text-sm font-semibold text-dull-black transition hover:bg-black hover:text-white'
            >
              {entry.title}
            </Link>
          ))}
        </div>
      </article>
    );
  }

  if (isPending) {
    return (
      <div
        className='spinner-container min-h-[50vh]'
        role='status'
        aria-live='polite'
        aria-busy
      >
        <Spinner label={`Loading ${topic.title}`} />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <article className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
        <PageHeader title={topic.title} subtitle={topic.subtitle} />
        <div className='mt-6 rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-red-900'>
          <p className='font-semibold'>Unable to load topic stories</p>
          <p className='text-sm'>{error.message}</p>
        </div>
      </article>
    );
  }

  return (
    <article className='mx-auto w-full max-w-[1600px] px-3 pb-12 pt-8 sm:px-4'>
      <PageHeader title={topic.title} subtitle={topic.subtitle} />
      <section className='mx-auto mt-6 max-w-5xl rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <p className='text-sm leading-relaxed text-dull-black/85'>{topic.description}</p>
        <div className='mt-4 flex flex-wrap gap-2'>
          {TOPIC_LANDINGS.map((entry) => (
            <Link
              key={entry.slug}
              to={`/topics/${entry.slug}`}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                entry.slug === topic.slug
                  ? 'border-black bg-black text-white'
                  : 'border-black/20 bg-white text-dull-black hover:bg-black hover:text-white'
              }`}
            >
              {entry.title}
            </Link>
          ))}
        </div>
      </section>

      {filteredPosts.length > 0 ? (
        <ul className='post-grid mt-8 grid grid-cols-1 gap-8 px-1 sm:px-2 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4'>
          {filteredPosts.map((post, index) => (
            <Post
              key={post.id}
              post={post}
              prioritizeMedia={index < 4}
              cachedPostsById={cachedPostsById}
            />
          ))}
        </ul>
      ) : (
        <div className='mx-auto mt-8 max-w-4xl rounded-lg border border-black/15 bg-white/90 px-4 py-4 text-center text-dull-black'>
          No stories are currently available for this topic. Check another collection.
        </div>
      )}
    </article>
  );
}

export default TopicLanding;
