import { Link } from 'react-router-dom';

export interface CategoryHeaderProps {
  categoryId: string;
  title: string;
}

function CategoryHeader({ categoryId, title }: CategoryHeaderProps) {
  return (
    <header className='category-header flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
      <h2 className='category-title' id={`category-heading-${categoryId}`}>
        {title}
      </h2>
      <Link
        to={`/posts/categories/${categoryId}`}
        state={{ category: title }}
        className='category-header__cta text-sm font-semibold uppercase tracking-wide text-dull-black underline decoration-2 underline-offset-4 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
      >
        View all
      </Link>
    </header>
  );
}

export default CategoryHeader;
