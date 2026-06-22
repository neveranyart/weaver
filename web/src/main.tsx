import { weaverSetup } from '@neveranyart/weaver';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { GlobalTunnel } from './context';
import './index.css';
import { activateLenis, lenisInstance } from './lenisInstance';
import Root from './routes/__root';

/**
 * Set a default tunnel for `<SceneSync />`
 */
weaverSetup.set3DTunnel(GlobalTunnel.Canvas.In);

/**
 * Activate the normal Lenis implementation to control the underlying instance
 * for ease of access.
 */
activateLenis();
weaverSetup.setLenisInstance(lenisInstance);

const NotFound = lazy(() => import('./routes/404'));
const Home = lazy(() => import('./routes/home'));
const Depth = lazy(() => import('./routes/depth'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />, // Wehre the magic happens.
    errorElement: import.meta.env.DEV ? undefined : <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense>
            <Home />
          </Suspense>
        ),
        handle: { identifier: 'Home' },
      },
      {
        path: '/depth',
        element: (
          <Suspense>
            <Depth />
          </Suspense>
        ),
        handle: { identifier: 'depth' },
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
