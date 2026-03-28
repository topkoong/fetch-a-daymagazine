import JsonLd from '@components/JsonLd';
import PageHeader from '@components/PageHeader';
import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import useSeo from '@hooks/useSeo';
import { buildEvergreenWebPageStructuredData } from '@utils/structured-data';
import { Link } from 'react-router-dom';

const COLLECTIONS_STANDARDS = [
  'Each tile maps to a live category feed backed by WordPress data.',
  'Labels mirror the navigation taxonomy so you always know which desk you entered.',
] as const;

const COLLECTIONS_FAQ = [
  {
    q: 'Why group by category instead of one endless list?',
    a: 'Intent-led collections reduce noise. You pick the lane—work, culture, design—and the feed stays focused.',
  },
  {
    q: 'Will I see every story ever published?',
    a: 'Feeds honor API pagination and cache snapshots. For exhaustive archives, use the original site when you need guaranteed completeness.',
  },
] as const;

function Collections() {
  useSeo({
    title: 'Collections',
    description:
      'Browse curated category collections from a day magazine with quick access to high-signal topics.',
    path: '/collections',
  });

  return (
    <article className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
      <JsonLd data={buildEvergreenWebPageStructuredData('/collections', 'Collections')} />
      <PageHeader
        title='Collections'
        subtitle='Choose a category collection and go directly to the stories that match your intent.'
      />

      <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Curated by topic
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/80 sm:text-base'>
          These collections are synced from the editorial source and optimized for fast
          discovery. Tap a collection to open the dedicated feed instantly.
        </p>
        <div className='mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
          {Object.entries(PRIMARY_NAV_CATEGORIES).map(([categoryId, label]) => (
            <Link
              key={categoryId}
              to={`/posts/categories/${categoryId}`}
              state={{ category: label }}
              className='rounded-md border border-black/15 bg-white px-3 py-2 text-center text-xs font-semibold tracking-wide text-dull-black transition hover:bg-black hover:text-white sm:text-sm'
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Editorial standards on this page
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/80 sm:text-base'>
          Collections are not hand-picked advertorial lists—they are direct paths into the
          same category feeds that power the broader experience, presented here for quick
          orientation.
        </p>
        <ul className='mt-4 space-y-2 text-sm leading-7 text-dull-black/85'>
          {COLLECTIONS_STANDARDS.map((line) => (
            <li
              key={line}
              className='rounded-md border border-black/10 bg-white/80 px-3 py-2'
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Source transparency
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/80 sm:text-base'>
          Category metadata and membership come from the publisher API. When you tap a
          collection, the next screen lists posts returned for that category id. If the
          API or cache is stale, counts may lag briefly behind the main site.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Reading philosophy
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/80 sm:text-base'>
          Think of this page as a departure board: choose a direction, then commit to a
          feed. The goal is fewer half-open tabs and more finished reads.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Frequently asked questions
        </h2>
        <div className='mt-4 space-y-3'>
          {COLLECTIONS_FAQ.map((item) => (
            <article
              key={item.q}
              className='rounded-md border border-black/10 bg-white/80 px-3 py-3'
            >
              <h3 className='text-sm font-bold text-dull-black'>{item.q}</h3>
              <p className='mt-1 text-sm leading-7 text-dull-black/80'>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <div className='mt-8 flex flex-wrap gap-3'>
        <Link
          to='/insights'
          className='inline-flex min-h-11 items-center rounded-md border border-black/60 bg-white px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5'
        >
          See how we think about product
        </Link>
        <Link
          to='/about'
          className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85'
        >
          About Toppy
        </Link>
      </div>
    </article>
  );
}

export default Collections;
