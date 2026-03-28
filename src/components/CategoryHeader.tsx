import { Link } from 'react-router-dom';

export interface CategoryHeaderProps {
  categoryId: string;
  title: string;
}

/** Normalizes known bad labels from upstream category names (e.g. ARRT → ART). */
export function formatFeedSectionTitle(raw: string): string {
  return raw.replace(/\bARRT\b/gi, 'ART').trim();
}

function CategoryHeader({ categoryId, title }: CategoryHeaderProps) {
  const label = formatFeedSectionTitle(title);

  return (
    <header className='category-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
      <h2
        className='text-sm font-bold uppercase tracking-[0.1em] text-dull-black'
        id={`category-heading-${categoryId}`}
      >
        {label}
      </h2>
      <Link
        to={`/posts/categories/${categoryId}`}
        state={{ category: label }}
        className='category-header__cta shrink-0 text-sm font-semibold normal-case text-dull-black underline decoration-2 underline-offset-4 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
      >
        View all
      </Link>
    </header>
  );
}

export default CategoryHeader;
