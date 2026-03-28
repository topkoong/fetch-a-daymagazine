/**
 * Site chrome: fixed top **primary nav** (brand, evergreen links, topic hubs, Insights),
 * external link to the publisher, and **WordPress category desks** via
 * {@link NavbarDesktopCategoryStrip} (lg+) / {@link NavbarMobileCategoryLinks} (sheet).
 * Mobile uses a disclosure panel (`aria-expanded` / `aria-controls`) for keyboard/screen readers.
 */
import {
  NavbarDesktopCategoryStrip,
  NavbarMobileCategoryLinks,
} from '@components/NavbarCategoryRow';
import { useCallback, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

const MOBILE_NAV_PANEL_ID = 'primary-navigation-menu';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((open) => !open), []);

  return (
    <nav
      className='fixed left-0 right-0 top-0 z-[100] w-full border-t-2 border-blue-700 bg-black'
      aria-label='Primary'
    >
      <div className='mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6'>
        <div className='flex flex-shrink-0 items-center'>
          <Link
            to='/'
            className='text-xl font-semibold uppercase tracking-tight text-white transition hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 sm:text-2xl'
            onClick={closeMobileMenu}
          >
            Lazy News
          </Link>
        </div>
        <ul className='hidden list-none items-center gap-2 md:flex lg:gap-3'>
          <li>
            <Link
              to='/about'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to='/collections'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Collections
            </Link>
          </li>
          <li>
            <Link
              to='/topics/business'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Business
            </Link>
          </li>
          <li>
            <Link
              to='/topics/world'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              World
            </Link>
          </li>
          <li>
            <Link
              to='/topics/culture'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Culture
            </Link>
          </li>
          <li>
            <Link
              to='/topics/design'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Design
            </Link>
          </li>
          <li>
            <Link
              to='/topics/lifestyle'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Lifestyle
            </Link>
          </li>
          <li>
            <Link
              to='/insights'
              className='rounded px-2 py-1 text-xs font-semibold tracking-wide text-white/85 transition hover:text-white'
              onClick={closeMobileMenu}
            >
              Insights
            </Link>
          </li>
        </ul>
        <a
          href='https://adaymagazine.com/'
          target='_blank'
          rel='noreferrer'
          className='hidden rounded border border-white/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10 lg:block'
        >
          Open source newsroom
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
      <NavbarDesktopCategoryStrip onNavigate={closeMobileMenu} />
      <div
        id={MOBILE_NAV_PANEL_ID}
        className={`${isMobileMenuOpen ? 'flex' : 'hidden'} mx-auto w-full max-w-[1600px] flex-grow flex-col border-t border-white/15 bg-black px-4 pb-4 pt-3 lg:hidden`}
      >
        <ul className='grid list-none grid-cols-2 gap-1 sm:grid-cols-3'>
          <li>
            <Link
              to='/about'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to='/collections'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Collections
            </Link>
          </li>
          <li>
            <Link
              to='/topics/business'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Business
            </Link>
          </li>
          <li>
            <Link
              to='/topics/world'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              World
            </Link>
          </li>
          <li>
            <Link
              to='/topics/culture'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Culture
            </Link>
          </li>
          <li>
            <Link
              to='/topics/design'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Design
            </Link>
          </li>
          <li>
            <Link
              to='/topics/lifestyle'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Lifestyle
            </Link>
          </li>
          <li>
            <Link
              to='/insights'
              className='block rounded px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:text-sm'
              onClick={closeMobileMenu}
            >
              Insights
            </Link>
          </li>
          <NavbarMobileCategoryLinks onNavigate={closeMobileMenu} />
        </ul>
        <a
          href='https://adaymagazine.com/'
          target='_blank'
          rel='noreferrer'
          className='mt-3 rounded border border-white/40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10'
        >
          Open source newsroom
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
