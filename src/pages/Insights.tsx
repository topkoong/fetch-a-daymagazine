/**
 * **Insights** — product/editorial strategy narrative, transparency, FAQ. Static content with
 * JSON-LD WebPage + `useSeo`.
 */
import JsonLd from '@components/JsonLd';
import PageHeader from '@components/PageHeader';
import useSeo from '@hooks/useSeo';
import { buildEvergreenWebPageStructuredData } from '@utils/structured-data';
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

const INSIGHTS_FAQ = [
  {
    q: 'Does caching mean I see old stories?',
    a: 'Caches are refreshed on a cadence defined by maintainers. Live API calls still run when the environment allows, so many sessions stay current.',
  },
  {
    q: 'How do you measure success for this product?',
    a: 'We look for faster comprehension, fewer dead ends, and repeat visits—signals that readers trust the desk enough to return.',
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
      <JsonLd
        data={buildEvergreenWebPageStructuredData('/insights', 'Editorial Insights')}
      />
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

      <section className='mt-6 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Source transparency
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/85 sm:text-base'>
          Insights describe product decisions, not newsroom assignments. Editorial voice,
          fact-checking, and corrections remain with a day magazine. Toppy engineers and
          designers focus on how that work is discovered and read once it is published
          through public APIs.
        </p>
        <p className='mt-3 text-sm leading-7 text-dull-black/85 sm:text-base'>
          When documentation references “cache,” it means JSON snapshots stored with the
          codebase or generated in automation—not a separate editorial database.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Reading philosophy
        </h2>
        <p className='mt-2 text-sm leading-7 text-dull-black/85 sm:text-base'>
          Long-form journalism deserves interfaces that slow down in the right ways:
          generous line height, clear section breaks, and CTAs that describe outcomes
          instead of generic commands. We extend that philosophy to list views as
          well—cards should answer “why should I care?” before you commit to a click.
        </p>
      </section>

      <section className='mt-5 rounded-xl border border-black/15 bg-white/90 p-5 shadow-sm sm:p-7'>
        <h2 className='text-lg font-bold tracking-tight text-dull-black sm:text-xl'>
          Frequently asked questions
        </h2>
        <div className='mt-4 space-y-3'>
          {INSIGHTS_FAQ.map((item) => (
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
          to='/'
          className='inline-flex min-h-11 items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85'
        >
          Return to the live story desk
        </Link>
        <Link
          to='/about'
          className='inline-flex min-h-11 items-center rounded-md border border-black/60 bg-white px-4 py-2 text-sm font-semibold text-dull-black transition hover:bg-black/5'
        >
          See product positioning
        </Link>
      </div>
    </article>
  );
}

export default Insights;
