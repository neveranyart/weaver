<img width="2100" height="1423" alt="weaver" src="https://github.com/user-attachments/assets/c31e67a2-272e-4b3c-9f5e-4d3e1ad2817c" />

An in-house package for making performant React 19 CSR creative websites with ease.

# Introduction

This package is a collection of sub-packages for handling many moving part of a creative website.

Most components and tools are built with flexibility in mind, providing a balance between abstraction and verbose.

But some will have its constrains, planting itself deep into how your project structures.

To fully utilize this package, your project should already using `react-router`, `lenis` and `@react-three/*`.

> [!NOTE]
> `React v19+` is required.

# Installation

NPM:
```
npm i @neveranyart/weaver
```

# Documentations

- [`WeaverProvider`](#weaverprovider)
-  [Routing](#routing)
    - [`DelayedOutlet`](#delayeduutlet)
    - [`Pipeline`](#pipeline)
    - [`useWeaverState`](#useweaverstate)
- [Scene](#scene)
    - [`BakeScene`](#bakescene)
    - [`SceneSync`](#scenesync)
- [Hooks](#hooks)

---

## `WeaverProvider`

`WeaverProvider` is an optional context provider, but it's crucial if you're planning to use the package for 3D scenes and routing.

| Prop | Type | Description |
|------|------|-------------|
| `canvasTunnel?` | `BasicTunnelIn` | Allows weaver components to tunnels 3D scene into your R3F's `<Canvas />`. |
| `lenis?` | `Lenis` | Allows weaver's to have more percise calculations compares to browser's default DOM scroll event and automatic control when handling delayed routing. |

### Example

```tsx
import { WeaverProvider } from '@neveranyart/weaver';
import Lenis from 'lenis';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CanvasTunnel } from './tunnels';

const lenis = new Lenis({
  autoRaf: true,
  syncTouch: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WeaverProvider lenis={lenis} canvasTunnel={CanvasTunnel.In}>
      {/* ... */}
    </WeaverProvider>
  </StrictMode>
);
```

The `CanvasTunnel.Out` component should be placed inside your R3F's `<Canvas />` to receive the tunneled scenes from weaver:

```tsx
import { Preload } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CanvasTunnel } from './tunnels';

export default function ThreeCanvas() {
  return (
    <Canvas>
      <CanvasTunnel.Out />
      <Preload all />
    </Canvas>
  );
}
```

---


## Routing

The routing sub-package wraps around `react-router` to support delayed route transitions, while a route is pending, the previous route stays visible, giving you full control over animations and transitions.

It has been tested extensively, so you don't have to suffer like we did developing the package!

There are 2 components that plays with each other in order to pull this off, introducing `DelayedOutlet` and `Pipeline`.

> [!NOTE]
> The officially supported router setup is `BrowserRouter`/`createBrowserRouter`.
> 
> But in theory, these components does work with any type of routing provided by `react-router`.

## `DelayedOutlet`

A drop-in replacement for React Router's `<Outlet />` that delays mounting the incoming route by a configurable amount of time.


| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `delay` | `number` | Yes | How long (in ms) to delay mounting the incoming route. |

> [!CAUTION]
> The component only checks for imcoming component and expects that a new identifier is a new `Pipeline` handling it.
> 
> **Constraint:** Only one `DelayedOutlet` is allowed per app.

### Example

```tsx
import { DelayedOutlet } from '@neveranyart/weaver/routing';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

function Root() {
  return (
    <main>
      {/* Oh wow it's getting delayed for 500ms!!! */}
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

With weaver context:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WeaverProvider lenis={lenis} canvasTunnel={CanvasTunnel.In}>
      <RouterProvider router={router} />
    </WeaverProvider>
  </StrictMode>
);
```

## `Pipeline`

Declares a route's parent scope, handles route change lifecycle, and communicates with `DelayedOutlet`.

Each `Pipeline` requires two things that must match:

1. A **static, unique** `identifier` prop on the component.
2. A `handle` value on the route definition with the same identifier.

> [!WARNING]
> - `DelayedOutlet` checks for `handle.identifier` of last route match and throws error when isn't found.
> - **Mismatching the identifier will cause `Pipeline` to not own the route, staying in limbo.**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `identifier` | `string` | Yes | Must be **static** and **unique**. Must match the route's `handle.identifier`. |
| `title` | `string` | No | Sets the document title when this route is active. |
| `debugName` | `string` | No | Enables console logging on mounts/unmounts. |
| `contentReady` | `boolean` | No | Holds the pipeline until `true`. Useful for waiting on async resources like 3D scenes. |
| `lenisUsage` | `boolean` | No | Defaults to `true`. Set to `false` to prevent Pipeline from auto-managing Lenis scroll state when a context is provided. |

> [!CAUTION]
> - Only ONE `Pipeline` per path.
> - `Pipeline` cannot nest itself.

```tsx
import { DelayedOutlet, Pipeline } from '@neveranyart/weaver/routing';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, RouterProvider } from 'react-router';

function Root() {
  return (
    <main>
      <DelayedOutlet delay={500} />
    </main>
  );
}

function Home() {
  return (
    <Pipeline title="Weaver" debugName="Home" identifier="Home">
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
        element: <Suspense><Home /></Suspense>,
        handle: { identifier: 'Home' }, // must match Pipeline identifier
      },
      {
        path: '/projects',
        element: (
          <Suspense>
            <Pipeline title="Projects" debugName="Projects" identifier="projects">
              <p>Projects</p>
              <Link to="/">Navigate</Link>
            </Pipeline>
          </Suspense>
        ),
        handle: { identifier: 'projects' },
      },
      {
        path: '/projects/*',
        element: (
          <Suspense>
            <Pipeline title="Projects - Detail" debugName="Project Detail" identifier="details">
              <p>Hello world!</p>
              <Link to="/">Navigate</Link>
            </Pipeline>
          </Suspense>
        ),
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

### Waiting on content

Use `contentReady` to hold the pipeline until a resource (e.g. a 3D scene) is ready:

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

## `useWeaverState`

A hook for reacting to routing state changes. All values are read-only.

```ts
import { useWeaverState } from '@neveranyart/weaver/routing';

// true when the full routing process is complete. Recommended for gating UI visibility.
const pageRendered = useWeaverState('pageRendered');

// The identifier of the Pipeline that has taken over.
const activePipeline = useWeaverState('activePipeline');

// The identifier of the Pipeline whose components are currently on screen.
const activeParent = useWeaverState('activeParent');

// true while DelayedOutlet is handling a navigation.
const navigating = useWeaverState('navigating');
```

### Successful navigation

1. User navigates from `"/"` to `"/projects"` /// `pageRendered → false`, `navigating → true`.
2. `DelayedOutlet` receives the new parent and holds the parent.
4. Delay elapses /// `navigating → false`, the outgoing Pipeline at `"/"` unmounting.
5. The incoming `Pipeline` is set /// `activePipeline → "Projects"`.
6. New Pipeline mounts /// `activeParent → "Projects"`, `pageRendered → true`.

### Cancelled navigation

1. User navigates from `"/"` to `"/projects"` /// `pageRendered → false`, `navigating → true`.
2. `DelayedOutlet` receives the new parent and holds the parent.
3. User cancels before the delay elapses.
4. Detects mismatch, reverting /// `navigating → false`, `pageRendered → true`.

Pipeline actively checks for mismatch so step 4 applies even when user cancels before `DelayedOutlet` can hold parent and wait.

---

## Scene

A `@react-three/*` sub-package for syncing 3D scenes with DOM elements.

## `BakeScene`

Puts a 3D scene into the render pipeline and fires a callback when it's ready to go.

For `BakeScene` to work, you need to provide a tunnel via `WeaverProvider`. If you haven't set that up yet, head to the [0. `WeaverProvider`](#0-weaverprovider) section first:

The component accepts your normal 3D scene and sits patiently waiting for the renderer to finish its job. A `sceneKey` prop is required since everything shares the same tunnel and needs to stay sorted out.

Your scene content doesn't have to live *inside* `BakeScene`, this will make more sense when we get to `SceneSync`.

```tsx
<BakeScene
  onSceneReady={() => {}}
  sceneKey="homeSceneObjs"
>
  <Box />
  <PerspectiveCamera position={[0, 0, 5]} makeDefault />
</BakeScene>
```

### Waiting for the scene in a Pipeline

Combine `BakeScene` with `Pipeline`'s `contentReady` prop to hold a route transition until the 3D scene is actually loaded:

```tsx
function Home() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <Pipeline
      title="Weaver"
      debugName="Home"
      identifier="Home"
      contentReady={sceneReady}
    >
      <Weave />
      <Hero />
      <BakeScene
        onSceneReady={() => setSceneReady(true)}
        sceneKey="homeSceneObjs"
      >
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
      </BakeScene>
    </Pipeline>
  );
}
```

## `SceneSync`

Fit your 3D scene inside a DOM element!!!

Give it a ref to a DOM element, put your scene inside `SceneSync`, and it'll stay synced with that element. Following it as the user scrolls, resizes, or however else your layout moves around. A `sceneKey` is required here too.

Under the hood it creates a group containing your scene and repositions it either with scroll events or per-frame updates, depending on the `trackingMode` you pick.

`SceneSync` is also fully compatible with `BakeScene`, which handles responsiveness on its own, so no worries :D

> [!WARNING]
> - You can initialize any type of camera and set it at any `z` position, but do not set `x` and `y`, or move, or rotate it after mounted.
> - `SceneSync` assumes all objects sit at `z=0`. Moving the `control` group or mesh along z-axis will look off unless you're using an `OrthographicCamera`.

**For `relaxed` mode specifically**, provide a Lenis instance via `WeaverProvider`, DOM scroll events buffer a bit and Lenis smooths that out. Other tracking modes don't need it:

A basic example, a box that lives inside a `div`:

```tsx
function DOMBox() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div ref={container}>
      <SceneSync
        sceneKey="hello-box"
        attach={container}
        trackingMode="relaxed"
        scalingMode="blind"
      >
        <Box />
      </SceneSync>
    </div>
  );
}
```

#### `sceneKey`
```ts
sceneKey: string
```
Unique key for this scene across every components passed into the provided tunnel. React will tell you when collisions happen.

#### `attach`
```ts
attach: RefObject<HTMLElement | null>
```
The DOM element `SceneSync` will track and sync the scene position to.

```tsx
<div ref={container} />
<SceneSync attach={container}>
  <group />
</SceneSync>
```

#### `trackingMode`
```ts
trackingMode: 'relaxed' | 'balanced' | 'aggressive'
```

Controls how often the scene position gets recalculated. Pick your poison:

| Mode | Strategy | Advantages | Caveats |
|------|----------|------|-------|
| `relaxed` | IntersectionObserver + Lenis + ResizeObserver | Minimal updates, best performance | Desyncs if the DOM element moves without resizing; scene may linger at the edges if `IntersectionObserver` says the DOM element is out of view before the scene fully clears. |
| `balanced` | IntersectionObserver + per-frame updates + ResizeObserver | Handles freely-moving elements at acceptable performance | Updates every frame while in view; same edge-bleed issue as `relaxed`. |
| `aggressive` | Per-frame updates only, same approach as `<View />` from `@react-three/drei` | Precise, can't desync (if it does, that's a bug) | Updates every frame regardless of visibility; keep this to ~3 scenes max to keep performance high. |

When in doubt, go with `balanced`. Use `relaxed` for DOM elements that stay put and scene that don't overflows.

#### `control`
```ts
control?: RefObject<Group | Mesh | null>
```
By default `SceneSync` manages its own internal ref to drive position and scale. For when you want to control other aspects of the scene, pass your own ref here.

For just observing layout changes, use `onLayoutUpdate` instead.

#### `onLayoutUpdate`
```ts
onLayoutUpdate?: (
  rect: DOMRect,
  dimension: { w: number; h: number },
  position: { x: number; y: number }
) => void
```
Fires whenever the scene updates, giving you the DOM rect plus the calculated 3D dimensions and position.

#### `autoScaling`
```ts
autoScaling?: boolean  // default: true
```
Toggles automatic scaling. Disabling this also disables `scalingMode` and `scaleFactor`.

#### `scalingMode`
```ts
scalingMode?: 'estimate' | 'accurate' | 'blind' | 'stretch'
```

All modes allow objects to bleed outside the DOM element, they just differ in how scaling gets calculated:

| Mode | Behaviour |
|------|-----------|
| `estimate` | Default. Scales based on the scene's on-mount measurements. |
| `accurate` | Re-measures before every scale update, most precise, but incompatible with `relaxed` tracking. |
| `blind` | Treats the scene as a `1×1×1` cube and scales from there. Most stable when you're intentionally let the scene bleeds out, like a big array of pictures. |
| `stretch` | Ignores aspect ratio and just fills the DOM element's bounding box. |

#### `scaleFactor`
```ts
scaleFactor?: number
```
A multiplier to nudge the calculated scale up or down.

#### `autoPositioning`
```ts
autoPositioning?: boolean  // default: true
```
Toggles automatic positioning.

#### `rootMargin`
```ts
rootMargin?: string
```
Custom `rootMargin` passed to the `IntersectionObserver`. Ignored in `aggressive` mode.

#### `tunnelIn`
```ts
tunnelIn?: BasicTunnelIn
```
Override the provided tunnel for this scene specifically.

### HUD mode

Set `hud` to render this scene into a separate layer, useful when you want a custom camera or need to stack multiple scenes on top of each other.

```tsx
const control = useRef<Group>(null);

return (
  <SceneSync
    hud
    renderPriority={1}
    camera={<OrthographicCamera makeDefault zoom={100} position={[0, 0, 5]} />}
  >
    <Box />
  </SceneSync>
);
```

Pass `null` to `camera` to inherit the parent scene's camera instead.

| Prop | Type | Description |
|------|------|-------------|
| `hud` | `true` | Enables HUD mode. |
| `camera` | `ReactElement \| null` | Camera for this layer. Must have `makeDefault`. Pass `null` to use the parent's camera. |
| `renderPriority` | `number` | R3F render priority for this HUD layer. |

---

## Hooks

A collection of React hooks ranging from DOM to 3D to lenis scrolling.

### Universial hooks

Any hooks that doesn't require external packages imported will lives in `/hooks`.

- [`useBreakpoints`](https://github.com/neveranyart/weaver/blob/main/src/hooks/breakpoints.ts) ⚹ Screen breakpoints just like TailwindCSS in react.
- [`useDeviceMotion`](https://github.com/neveranyart/weaver/blob/main/src/hooks/deviceMotion.ts) ⚹ Device motion's API.
- [`useEffectOnce`, `useLayoutEffectOnce`](https://github.com/neveranyart/weaver/blob/main/src/hooks/effectOnce.ts) ⚹ Mount/unmount effect, ignore all states.
- [`useLenisCallback`](https://github.com/neveranyart/weaver/blob/main/src/hooks/lenisCallback.ts) ⚹ Lenis scroll callback with react to screen changes and the option to only call on element intersect.
- [`useScrollCallback`](https://github.com/neveranyart/weaver/blob/main/src/hooks/scrollCallback.ts) ⚹ DOM scroll callback with react to screen changes and the option to only call on element intersect.
- [`useMouseCallback`](https://github.com/neveranyart/weaver/blob/main/src/hooks/mouseCallback.ts) ⚹ DOM scroll callback with react to screen changes and the option to only call on element intersect.
- [`useOrbit`](https://github.com/neveranyart/weaver/blob/main/src/hooks/orbit.ts) ⚹ Quick `ResizeObserver` and `IntersectionObserver`.
- [`useReflect`](https://github.com/neveranyart/weaver/blob/main/src/hooks/reflect.ts) ⚹ Keeps a version of a state that has data, if the value is undefined or null, the hook doesn't change.
- [`useScreen`](https://github.com/neveranyart/weaver/blob/main/src/hooks/screen.ts) ⚹ State update when screen size changes.
- [`useScreenCallback`](https://github.com/neveranyart/weaver/blob/main/src/hooks/screenCallback.ts) ⚹ Callback when screen size changes.

### External packages hooks

Hooks that require a, or many external packages to be installed.

- [`useWeaverRouting`](https://github.com/neveranyart/weaver/blob/main/src/routing/hooks/weaverRouting.ts) ⚹ `react-router` specific. A hook to know what stage of the navigation transition when using weaver's routing, crucial for your page transition.
- [`useViewport`](https://github.com/neveranyart/weaver/blob/main/src/scene/hooks/viewport.ts) ⚹ `@react-three/fiber` specific. State change when camera or screen size changes with the actual measurements.
- [`useNavigateAnchor`](https://github.com/neveranyart/weaver/blob/main/src/routing/hooks/navigateAnchor.ts) ⚹ `react-router` specific. A hook to allow custom `<Link />` replacement with navigation event support.
- [`useRawParams`](https://github.com/neveranyart/weaver/blob/main/src/routing/hooks/rawParams.ts) ⚹ `react-router` specific. Updates and splits pathname on location change.

# License

LGPL-2.1-or-later
