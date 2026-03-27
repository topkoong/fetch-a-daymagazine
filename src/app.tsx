import Navbar from '@components/Navbar';
import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS } from '@constants/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'preact/compat';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@pages/Home'));
const PostDetails = lazy(() => import('@pages/PostDetails'));
const Posts = lazy(() => import('@pages/Posts'));

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
