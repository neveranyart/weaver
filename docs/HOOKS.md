# Hooks
A collection of React hooks ranging from DOM to 3D to lenis scrolling.

## Universial hooks
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

## External packages hooks
Hooks that require a, or many external packages to be installed.

- [`useViewport`](https://github.com/neveranyart/weaver/blob/main/src/scene/hooks/viewport.ts) ⚹ `@react-three/fiber` specific. State change when camera or screen size changes with the actual measurements.
- [`useNavigateAnchor`](https://github.com/neveranyart/weaver/blob/main/src/routing/hooks/navigateAnchor.ts) ⚹ `react-router` specific. A hook to allow custom `<Link />` replacement with navigation event support.
- [`useRawParams`](https://github.com/neveranyart/weaver/blob/main/src/routing/hooks/rawParams.ts) ⚹ `react-router` specific. Updates and splits pathname on location change.
