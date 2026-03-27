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
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
