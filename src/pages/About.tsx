import JsonLd from '@components/JsonLd';
import PageHeader from '@components/PageHeader';
import useSeo from '@hooks/useSeo';
import { buildEvergreenWebPageStructuredData } from '@utils/structured-data';
import { Link } from 'react-router-dom';

function About() {
  useSeo({
    title: 'About',
    description:
      'Learn how Toppy curates stories from a day magazine into a faster, cleaner, category-first reading experience.',
    path: '/about',
  });

  return (
    <article className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
      <JsonLd data={buildEvergreenWebPageStructuredData('/about', 'About')} />
      <PageHeader
        title='About Toppy'
        subtitle='A premium reading layer designed for focused discovery, strong editorial context, and better reading flow.'
      />

      <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-xl font-bold tracking-tight text-dull-black sm:text-2xl'>
          Why this experience exists
        </h2>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          We built Toppy for readers who value signal over noise. Stories from a day
          magazine are meaningful, but discovery can still feel fragmented. Toppy
          restructures that journey into category-first pathways, cleaner card design, and
          a more deliberate editorial rhythm.
        </p>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          The product focus is simple: faster understanding, less friction, and clearer
          decisions on what to read next.
        </p>
      </section>

      <section className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <article className='rounded-lg border border-black/12 bg-white/85 p-4'>
          <h3 className='text-sm font-bold tracking-wide text-dull-black'>
            Editorial clarity
          </h3>
          <p className='mt-2 text-sm leading-6 text-dull-black/80'>
            Headlines, context, and metadata are arranged for quick comprehension.
          </p>
        </article>
        <article className='rounded-lg border border-black/12 bg-white/85 p-4'>
          <h3 className='text-sm font-bold tracking-wide text-dull-black'>
            Reliable performance
          </h3>
          <p className='mt-2 text-sm leading-6 text-dull-black/80'>
            Cached data and resilient fallback flows keep reading available.
          </p>
        </article>
        <article className='rounded-lg border border-black/12 bg-white/85 p-4'>
          <h3 className='text-sm font-bold tracking-wide text-dull-black'>
            Purposeful navigation
          </h3>
          <p className='mt-2 text-sm leading-6 text-dull-black/80'>
            Category-driven routes support faster return visits and deeper sessions.
          </p>
        </article>
      </section>

      <div className='mt-8 flex flex-wrap gap-3'>
        <Link
          to='/'
          className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85'
        >
          Explore today&apos;s lead stories
        </Link>
        <Link
          to='/insights'
          className='inline-flex min-h-11 items-center rounded-md border border-black/60 bg-white px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5'
        >
          Review our editorial strategy
        </Link>
      </div>
    </article>
  );
}

export default About;
