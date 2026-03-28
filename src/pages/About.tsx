import JsonLd from '@components/JsonLd';
import PageHeader from '@components/PageHeader';
import useSeo from '@hooks/useSeo';
import { buildEvergreenWebPageStructuredData } from '@utils/structured-data';
import { Link } from 'react-router-dom';

const ABOUT_EDITORIAL_STANDARDS = [
  'Preserve publisher wording in titles and excerpts unless a technical truncation is required for layout.',
  'Surface categories using the same identifiers readers expect from a day magazine.',
  'Treat imagery and media as part of the story record, not decorative placeholders.',
] as const;

const ABOUT_FAQ = [
  {
    q: 'Is Toppy a separate newsroom?',
    a: 'No. It is an independent reading client that organizes public feeds from a day magazine with a focused UX.',
  },
  {
    q: 'How fresh is the content?',
    a: 'Freshness depends on API availability and how often maintainers refresh cached JSON. Live requests are attempted whenever possible.',
  },
  {
    q: 'Who is responsible for article accuracy?',
    a: 'The originating publication remains the editorial authority. Toppy presents that work in a different interface.',
  },
] as const;

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

      <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-xl font-bold tracking-tight text-dull-black sm:text-2xl'>
          Editorial standards
        </h2>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          We hold the interface to standards that protect reader trust: clarity about
          sourcing, no invented claims, and layouts that respect the underlying reporting.
        </p>
        <ul className='mt-4 space-y-2 text-sm leading-7 text-dull-black/85 sm:text-base'>
          {ABOUT_EDITORIAL_STANDARDS.map((line) => (
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
        <h2 className='text-xl font-bold tracking-tight text-dull-black sm:text-2xl'>
          Source transparency
        </h2>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          Data enters Toppy through the same public WordPress endpoints that power the
          main site. When maintainers run cache jobs, snapshots land in the repository so
          builds stay deterministic in environments that cannot reach the publisher (for
          example, some CI runners). Nothing in that pipeline rewrites article bodies.
        </p>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          If you need the canonical legal, advertising, or correction context for a piece,
          use the outbound action on the story page to open the original article on a day
          magazine.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-xl font-bold tracking-tight text-dull-black sm:text-2xl'>
          Reading philosophy
        </h2>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          Readers deserve interfaces that feel as intentional as the writing itself. We
          optimize for scannable hierarchy, minimal chrome, and routes that reward return
          visits—so the product feels like a desk you return to, not a feed you survive.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-xl font-bold tracking-tight text-dull-black sm:text-2xl'>
          Frequently asked questions
        </h2>
        <div className='mt-4 space-y-4'>
          {ABOUT_FAQ.map((item) => (
            <article
              key={item.q}
              className='rounded-md border border-black/10 bg-white/80 px-4 py-3'
            >
              <h3 className='text-sm font-bold tracking-wide text-dull-black sm:text-base'>
                {item.q}
              </h3>
              <p className='mt-2 text-sm leading-7 text-dull-black/80 sm:text-base'>
                {item.a}
              </p>
            </article>
          ))}
        </div>
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
