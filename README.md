<img width="2057" height="1033" alt="weaver" src="https://github.com/user-attachments/assets/bb452bd6-93f3-4848-9f2c-9e0661cd7175" />

An in-house package for making performant React CSR creative websites with ease.

## Introduction
This package is a collection of sub-packages for handling many moving part of a creative website.

Most components and tools are built with flexibility in mind, providing a balance between abstraction and verbose.

But some will have its constrains, planting itself deep into how your project structures.

This is not required, but to fully utilize this package, your project should already using `react-router`, `lenis` and `@react-three/*`.

> [!NOTE]
> `React v19+` is required.

## Installation
NPM:
```
npm i @neveranyart/weaver
```

## Documentations
1. [Routing](https://github.com/neveranyart/weaver/blob/main/docs/ROUTING.md)
    - [`DelayedOutlet`](https://github.com/neveranyart/weaver/blob/main/docs/ROUTING.md#delayedoutlet): Delay `react-router`'s `<Outlet/>` to allow transition animation, loading fallback.
    - [`Pipeline`](https://github.com/neveranyart/weaver/blob/main/docs/ROUTING.md#pipeline): Declare parent endpoint to communicate with `DelayedOutlet`.
2. [Scene](https://github.com/neveranyart/weaver/blob/main/docs/SCENE.md)
    - [`BakeScene`](https://github.com/neveranyart/weaver/blob/main/docs/SCENE.md#bakescene): Put 3D scene to render and notifies back when the scene is ready to be used.
    - [`SceneSync`](https://github.com/neveranyart/weaver/blob/main/docs/SCENE.md#scenesync): Fit your 3D scene inside a DOM element
3. [Hooks](https://github.com/neveranyart/weaver/blob/main/docs/HOOKS.md)

## License
LGPL-2.1-or-later
