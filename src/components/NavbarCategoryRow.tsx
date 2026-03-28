import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import { Fragment } from 'preact';
import { Link } from 'react-router-dom';

const ENTRIES = Object.entries(PRIMARY_NAV_CATEGORIES);

const linkDesktopClass =
  'block rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';

const linkMobileClass =
  'block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm';

/**
 * Category desk links — mounted only from {@link Navbar} (desktop strip + mobile sheet).
 */
export function NavbarDesktopCategoryStrip({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className='navbar-category-strip hidden border-t border-white/10 bg-black lg:block'>
      <div className='mx-auto max-w-[1600px] overflow-x-auto px-2 py-2 sm:px-4'>
        <ul className='flex min-w-max list-none items-center justify-center gap-1'>
          {ENTRIES.map(([categoryId, label]) => (
            <li key={categoryId}>
              <Link
                to={`/posts/categories/${categoryId}`}
                state={{ category: label }}
                className={linkDesktopClass}
                onClick={onNavigate}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function NavbarMobileCategoryLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Fragment>
      {ENTRIES.map(([categoryId, label]) => (
        <li key={categoryId}>
          <Link
            to={`/posts/categories/${categoryId}`}
            state={{ category: label }}
            className={linkMobileClass}
            onClick={onNavigate}
          >
            {label}
          </Link>
        </li>
      ))}
    </Fragment>
  );
}
