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
      className='border-t-2 border-blue-700 bg-black/95 py-3 shadow-md backdrop-blur'
      aria-label='Primary'
    >
      <div className='mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 pb-3 sm:px-6'>
        <div className='flex flex-shrink-0 items-center'>
          <Link
            to='/'
            className='text-xl font-semibold uppercase tracking-tight text-white transition hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 sm:text-2xl'
            onClick={closeMobileMenu}
          >
            Lazy News
          </Link>
        </div>
        <a
          href='https://adaymagazine.com/'
          target='_blank'
          rel='noreferrer'
          className='hidden rounded border border-white/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10 md:block'
        >
          Visit a day source
        </a>
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
      <div className='hidden border-y border-white/15 px-2 py-2 sm:px-4 lg:block'>
        <div className='mx-auto max-w-[1600px]'>
          <ul className='flex list-none flex-wrap items-center justify-center gap-1 pb-1'>
            {Object.entries(PRIMARY_NAV_CATEGORIES).map(([categoryId, label]) => (
              <li key={categoryId}>
                <Link
                  to={`/posts/categories/${categoryId}`}
                  state={{ category: label }}
                  className='block rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
                  onClick={closeMobileMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        id={MOBILE_NAV_PANEL_ID}
        className={`${isMobileMenuOpen ? 'flex' : 'hidden'} mx-auto w-full max-w-[1600px] flex-grow flex-col border-t border-white/15 px-4 pt-3 lg:hidden`}
      >
        <ul className='grid list-none grid-cols-2 gap-1 sm:grid-cols-3'>
          {Object.entries(PRIMARY_NAV_CATEGORIES).map(([categoryId, label]) => (
            <li key={categoryId}>
              <Link
                to={`/posts/categories/${categoryId}`}
                state={{ category: label }}
                className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
                onClick={closeMobileMenu}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href='https://adaymagazine.com/'
          target='_blank'
          rel='noreferrer'
          className='mt-3 rounded border border-white/40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10'
        >
          Visit a day source
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
