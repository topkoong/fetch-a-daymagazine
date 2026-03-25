import { PRIMARY_NAV_CATEGORIES } from '@constants/nav-categories';
import { useCallback, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

const MOBILE_NAV_PANEL_ID = 'primary-navigation-menu';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((open) => !open), []);

  return (
    <nav
      className='border-t-2 border-blue-700 bg-black py-4 shadow-md lg:px-12'
      aria-label='Primary'
    >
      <div className='flex w-full flex-wrap items-center justify-between border-b-2 border-gray-300 pb-5 pl-6 pr-2 lg:w-auto lg:border-b-0 lg:pb-0'>
        <div className='mr-16 flex flex-shrink-0 items-center'>
          <Link
            to='/'
            className='text-3xl font-semibold uppercase tracking-tight text-white transition hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400'
            onClick={closeMobileMenu}
          >
            Lazy News
          </Link>
        </div>
        <div className='block lg:hidden'>
          <button
            type='button'
            className='flex items-center rounded border-2 border-blue-700 px-3 py-2 text-blue-700 transition hover:bg-blue-900/30 hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
            aria-expanded={isMobileMenuOpen}
            aria-controls={MOBILE_NAV_PANEL_ID}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <svg
                className='h-5 w-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            ) : (
              <svg
                className='h-5 w-5 fill-current'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden
              >
                <path d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z' />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div
        id={MOBILE_NAV_PANEL_ID}
        className={`${isMobileMenuOpen ? 'flex' : 'hidden'} flex-grow flex-col px-8 lg:flex lg:flex-row lg:items-center lg:px-3`}
      >
        <ul className='mt-2 flex list-none flex-col gap-1 lg:ml-auto lg:mt-0 lg:flex-row lg:gap-0'>
          {Object.entries(PRIMARY_NAV_CATEGORIES).map(([categoryId, label]) => (
            <li key={categoryId}>
              <Link
                to={`/posts/categories/${categoryId}`}
                state={{ category: label }}
                className='block rounded px-2 py-3 text-sm font-bold uppercase text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 lg:mt-0 lg:inline-block lg:py-2'
                onClick={closeMobileMenu}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
