import JsonLd from '@components/JsonLd';
import PageHeader from '@components/PageHeader';
import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import useSeo from '@hooks/useSeo';
import { buildEvergreenWebPageStructuredData } from '@utils/structured-data';
import { Link } from 'react-router-dom';

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
    </article>
  );
}

export default Collections;
