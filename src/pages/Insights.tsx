import PageHeader from '@components/PageHeader';
import useSeo from '@hooks/useSeo';
import { Link } from 'react-router-dom';

const INSIGHT_SECTIONS = [
  {
    title: 'Category-first decision model',
    body: 'Users rarely start with a single headline. They start with intent. We prioritize category pathways so readers can immediately align with business, design, culture, and life interests.',
  },
  {
    title: 'Readable card intelligence',
    body: 'Every card combines title, excerpt, date, and destination action. This reduces decision latency and creates a stronger sense of editorial confidence.',
  },
  {
    title: 'Build-time content resilience',
    body: 'Story payloads and detail caches are prepared ahead of runtime. This lowers risk during source outages and preserves a premium reading flow.',
  },
] as const;

function Insights() {
  useSeo({
    title: 'Editorial Insights',
    description:
      'Explore the UX and content strategy behind Toppy, from category-first navigation to build-time editorial caching.',
    path: '/insights',
  });

  return (
    <article className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
      <PageHeader
        title='Editorial Insights'
        subtitle='How we structure content, interfaces, and performance to feel like a high-end publication product.'
      />

      <section className='mt-6 space-y-4'>
        {INSIGHT_SECTIONS.map((section) => (
          <article
            key={section.title}
            className='rounded-xl border border-black/12 bg-white/90 p-5 shadow-sm sm:p-6'
          >
            <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
              {section.title}
            </h2>
            <p className='mt-2 text-sm leading-7 text-dull-black/85 sm:text-base'>
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <div className='mt-8 flex flex-wrap gap-3'>
        <Link
          to='/'
          className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85'
        >
          Return to the live story feed
        </Link>
        <Link
          to='/about'
          className='inline-flex min-h-11 items-center rounded-md border border-black/60 bg-white px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5'
        >
          View product positioning
        </Link>
      </div>
    </article>
  );
}

export default Insights;
