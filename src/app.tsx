/**
 * Root layout: **TanStack Query** wraps the whole tree so any page can share cache keys
 * (e.g. `queryKeys.allPosts` on Home and PostDetails). Each route is **lazy-loaded** to keep
 * the initial JS small; paths are **relative to** `BrowserRouter` basename in `main.tsx`.
 *
 * **Route order:** `posts/categories/:id` is registered **before** `posts/:id` so three-segment
 * category URLs never compete with the numeric article pattern (React Router already ranks
 * static segments, but explicit ordering documents intent).
 */
import Navbar from '@components/Navbar';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS } from '@constants/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'preact/compat';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@pages/Home'));
const About = lazy(() => import('@pages/About'));
const Collections = lazy(() => import('@pages/Collections'));
const Insights = lazy(() => import('@pages/Insights'));
const PostDetails = lazy(() => import('@pages/PostDetails'));
const Posts = lazy(() => import('@pages/Posts'));
const TopicLanding = lazy(() => import('@pages/TopicLanding'));

/** Global query defaults: editorial cadence `staleTime` matches `REFETCH_INTERVAL` in constants. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: DEFAULT_STALE_TIME_MS,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <main className='min-h-0 overflow-x-hidden pt-16 lg:pt-[7.75rem]'>
        <Routes>
          <Route
            path='/'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading home' />
                  </div>
                }
              >
                <Home />
              </Suspense>
            }
          />
          <Route
            path='about'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading about page' />
                  </div>
                }
              >
                <About />
              </Suspense>
            }
          />
          <Route
            path='collections'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading collections page' />
                  </div>
                }
              >
                <Collections />
              </Suspense>
            }
          />
          <Route
            path='insights'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading insights page' />
                  </div>
                }
              >
                <Insights />
              </Suspense>
            }
          />
          <Route
            path='topics/:slug'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading topic stories' />
                  </div>
                }
              >
                <TopicLanding />
              </Suspense>
            }
          />
          <Route
            path='posts/categories/:id'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading category' />
                  </div>
                }
              >
                <Posts />
              </Suspense>
            }
          />
          <Route
            path='posts/:id'
            element={
              <Suspense
                fallback={
                  <div className='spinner-wrapper min-h-[50vh]'>
                    <Spinner label='Loading article' />
                  </div>
                }
              >
                <PostDetails />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </QueryClientProvider>
  );
}

export default App;
