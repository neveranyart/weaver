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

To make each step in the process of routing atomic, we had to make some trade-offs.

- Each `Pipeline` must have a **static, unique** identifier, so the component can query for it and perform the correct action when navigation happens.
- Each route must have a handle value with the same value as the identifier to report the `Pipeline` and do things mentioned.

Failing to do 1 or 2 things above will results in unknown behavior.

> [!CAUTION]
> Only be ONE `Pipeline` per path.
>
> It can't nest itself.

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
    <Pipeline
      title="Weaver"
      debugName="Home"
      /* IMPORTANT: Setting identifier. */
      identifier="Home"
    >
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
        /* IMPORTANT: Setting identifier. */
        handle: { identifier: 'Home' },
      },
      {
        path: '/projects',
        element: (
          <Suspense>
            <Pipeline
              title='Projects'
              debugName='Projects'
              /* IMPORTANT: Setting identifier. */
              identifier="something"
            >
              <p>Projects</p>
              <Link to="/">Navigate</Link>
            </Pipeline>
          </Suspense>
        ),
        /* IMPORTANT: Setting identifier. */
        handle: { identifier: 'something' },
      },
      {
        path: '/projects/*',
        element: (
          <Suspense>
            <Pipeline
              title='Projects - Wow'
              debugName='Projects Details'
              /* IMPORTANT: Setting identifier. */
              identifier="details"
            >
              <p>Hello world!</p>
              <Link to="/">Navigate</Link>
            </Pipeline>
          </Suspense>
        ),
        /* IMPORTANT: Setting identifier. */
        handle: { identifier: 'details' },
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

### Waiting resources
`Pipline` has a props called `contentReady`, if this is `true`, it will continue doing its job to show the content on screen. If it's `false`, `Pipeline` will wait for it.

For example, waiting for 3D scene to ready before move on to other stages:

```tsx
<Pipeline
  title="Weaver"
  debugName="Home"
  identifier="Home"
  contentReady={sceneReady}
>
  <BakeScene
    onSceneReady={() => setSceneReady(true)}
    sceneKey="homeSceneObjs"
  >
    <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
  </BakeScene>
</Pipeline>
```

### Lenis
By deafult, `Pipeline` will control lenis if possible, it will automatically stop, start lenis scroll. To disable this behavior, set `lenisUsage` to `false`.

```tsx
<Pipeline
  lenisUsage={false}
/>
```

### Debugging
If `debugName` is provided, `Pipeline` will log stage changes to the console, unset the prop to not log anything.

```tsx
<Pipeline
  debugName="Home"
/>
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
