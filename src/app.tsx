import './app.css';

import Spinner from '@components/Spinner';
import { DEFAULT_STALE_TIME_MS } from '@constants/index';
import { lazy, Suspense } from 'preact/compat';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

const Navbar = lazy(() => import('@components/Navbar'));
const Home = lazy(() => import('@pages/Home'));
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
      <Suspense
        fallback={
          <div className='flex min-h-[30vh] items-center justify-center'>
            <Spinner label='Loading navigation' />
          </div>
        }
      >
        <Navbar />
      </Suspense>
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
