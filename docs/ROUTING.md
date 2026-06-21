# Routing
The package wraps around `react-router` as a base for working with routing because it provides us a way to postpone parent components mounting.

This sub-package ensures `react-router` usage just like intended. It has especially tested against going back and forth rapidly and works flawlessly in strict mode, even with throttle the CPU to a good x20 slowdown, so you don't have to suffer like we did developing the package!

While the route is delayed, the previous route is still displayed, allowing you create any smooth, highly customizable tranition to your likings.

> [!CAUTION]
> The only officially supported router is `BrowserRouter` data mode, we don't test with other methods.

## `DelayedOutlet`
A drop-in replacement component for `Outlet` with a `delay` variable, you can adjust this based on your needs.

> [!CAUTION]
> There can only be ONE `DelayedOutlet` per app.

Recommended example usage, delayed for `500ms`:
```tsx
import { DelayedOutlet } from '@neveranyart/weaver/routing';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

function Root() {
  return (
    <main>
      {/* Place any other components here, like a navbar and a loading screen for example. */}
      <DelayedOutlet delay={500} />
    </main>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

## `Pipeline`
Declares parent for a route, handle route changes and communicates with `DelayedOutlet`.

> [!CAUTION]
> Only be ONE `Pipeline` per path.
>
> It can't nest itself.

Recommended place to put the component is the parent for a route's components

Example usage with 2 endpoints, taken from previous example from `DelayedOutlet`:

```tsx
import { DelayedOutlet, Pipeline } from '@neveranyart/weaver/routing';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, RouterProvider } from 'react-router';

function Root() {
  return (
    <main>
      {/* Place any other components here, like a navbar and a loading screen for example. */}
      <DelayedOutlet delay={500} />
    </main>
  );
}

function Home() {
  return (
    <Pipeline title='Home' debugName='Home' parentPath='/'>
      <p>Home</p>
      <Link to="/projects">Navigate</Link>
    </Pipeline>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: (
          <Suspense>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/projects/*',
        element: (
          <Suspense>
            <Pipeline title='Projects' debugName='Projects' parentPath='/projects/*'>
              <p>Projects</p>
              <Link to="/">Navigate</Link>
            </Pipeline>
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

## State hooks
Routing also provides a quick way to react to state changes with a cool hook called `useWeaverState`. Containing 4 read-only states for you to play with:

```ts
// Covers the whole routing process. It is the recommended way of knowing if the content is ready to be displayed or not
const pageRendered = useWeaverState('pageRendered');

// Knowing which Pipeline has taken over previous one.
const activePipeline = useWeaverState('activePipeline');

// Which Pipeline has delivered its components on screen.
const activeParent = useWeaverState('activeParent');

// Tells when `DelayedOutlet` handles routing.
const navigating = useWeaverState('navigating');
```

When a route change happens, this is how states in `weaver/routing` changes when a route change is successful:

- `+`: Other events/information.
- `!`: State changes.

```
+ Current `Pipeline` path: "/"
+ User navigates.
! pageRendered -> false, navigating -> true.
+ Receives new parent.
  + Delay route change.
+ Set new `Pipeline`.
  + `Pipeline` path "/" start unmounting process.
  + New `Pipeline` path: "/projects".
    ! activePipeline -> "/projects".
! navigating -> false.
+ New `Pipeline` start mounting process.
  ! pageRendered -> true, activeParent -> "/projects".
```

When a route change is cancelled by user:

```
+ Current `Pipeline` path: "/"
+ User navigates.
! pageRendered -> false, navigating -> true.
+ Receives new parent.
  + Delay route change.
+ User cancelled.
+ `Pipeline` path "/" detects cancel.
  ! pageRendered -> true, navigating -> false.
```
