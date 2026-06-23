<img width="1937" height="1175" alt="idk" src="https://github.com/user-attachments/assets/4195c10e-35f8-4308-a30f-23e8916b6399" />

An in-house core package with many fun, little tools by neveranyart for making performant React CSR websites.

> [!WARNING]
> The package is still in active development with many changes between each releases to cover more cases.
> 
> So before version 1.0.0 is released, no migration guide will be provided.
> 
> Due to conflict with LICENSE commits, we've decided to discard the original history for this repository.

## Introduction
This package is a collection of sub-packages for handling many moving part of a creative web with ease.

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
