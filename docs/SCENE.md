# Scene
A `@react-three/fiber` focused sub-package for syncing, incorporating with DOM elements.

## `BakeScene`
Put 3D scene to render and notifies back when the scene is ready to be used.

> [!CAUTION]
> For `BakeScene` to work, you must provide a tunnel, you can create a tunnel via `tunnel-rat`.
> Then pass the `In` component to weaver from `weaverSetup`:
> ```tsx
> import { Preload } from '@react-three/drei';
> import { Canvas } from '@react-three/fiber';
> import { weaverSetup } from '@neveranyart/weaver';
> import tunnel from 'tunnel-rat';
> /**
>  * Set a default tunnel for `weaver/scene`
>  */
> const WeaverTunnel = tunnel();
> weaverSetup.set3DTunnel(WeaverTunnel.In);
>
> function ThreeCanvas() {
>   return (
>     <Canvas>
>       <WeaverTunnel.Out />
>       <Preload all />
>     </Canvas>
>  );
> }
> ```

The component accepts your normal 3D scene, it will then sits and wait for the renderer to finish the job.

Plus, your scene doesn't have to be inside of `BakeScene`, this will comes in handy later as we talk about `SceneSync`.

For example, a `BakeScene` with a box and a default camera:
```tsx
<BakeScene onSceneReady={() => {}}>
  <Box />
  <PerspectiveCamera position={[0, 0, 5]} makeDefault />
</BakeScene>
```

From here, we can combine with `Pipeline` to wait for scene loading too:
```tsx
function Contact() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <Pipeline
      title={'Spideration - Contact'}
      debugName={'Contact'}
      parentPath={'/contact'}
      contentReady={sceneReady}
    >
      <BakeScene onSceneReady={() => setSceneReady(true)}>
        <Box />
        <PerspectiveCamera position={[0, 0, 5]} makeDefault />
      </BakeScene>
    </Pipeline>
  );
}
```

## `SceneSync`
Fit your 3D scene inside a DOM element!!!

Create a DOM element, and pass its ref to `SceneSync`, put your 3D scene inside of `SceneSync`. And that scene will get synced with
that DOM element, there are multiple ways for you to decide on how a scene should be synced.

The component works by creating a group, containing your scene, and position the group along with user scroll, or frame-based positioning.

> [!CAUTION]
> Limitations:
> - You can initialize any type of camera, but in no way you should move/rotate it.
> - `SceneSync` assumes all objects are at `z=0`, so if you move the `control` group/mesh, it will look off.

There are 3 modes: `relaxed`, `balanced` and `aggressive`:
- `relaxed`: Uses IntersectionObserver paired with lenis hook, together with ResizeObserver.
   - (+): Minimal update calls, best performance.
   - (-): The scene get desynced the moment DOM element moves without changing its sizes.
          When the scene bleeds out of the DOM element too much, if IntersectionObserver reported that the DOM element
          is out of view, the part of the scene that did not fully moved out of view will stay there.
- `balanced`: Uses IntersectionObserver paired with frame-based update, together with ResizeObserver.
   - (+): Just enough update calls to allow the DOM element to move freely while maintain aceptable performance.
   - (-): It will update on every frame when the object gets into view as reported by IntersectionObserver. And the same
          problem with `relaxed` mode when the scene bleeds out too much.
- `aggressive`: Frame-based update only. This mode is like how `<View />` from `@react-three/drei` kepts track of DOM elements.
   - (+): Designed for precise element <-> scene updates. Can't be desynced, if desynced, that's a bug.
   - (-): This is frame-based. It will fire updates as long as the scene is still mounted. Too many scenes with this
          mode enabled is not a good idea. Acceptable amount would be 3 scenes with this mode.

> [!CAUTION]
> For `SceneSync`'s `relaxed` mode to work, you must provide a lenis instance, other modes doesn't require it:
> ```tsx
> import { Preload } from '@react-three/drei';
> import { Canvas } from '@react-three/fiber';
> import { weaverSetup } from '@neveranyart/weaver';
> import Lenis from 'lenis';
> import { frame } from 'motion/react';
> import tunnel from 'tunnel-rat';
> 
> export const lenisInstance = new Lenis({
>   syncTouch: false,
> });
>
> export function activateLenis() {
>   function update(data: { timestamp: number }) {
>     lenisInstance.raf(data.timestamp);
>   }
>
>   frame.update(update, true);
> }
> 
> /**
>  * Provide lenis instance.
>  */
> activateLenis();
> weaverSetup.setLenisInstance(lenisInstance);
>
> /**
>  * Set a default tunnel for `weaver/scene`
>  */
> const WeaverTunnel = tunnel();
> weaverSetup.set3DTunnel(WeaverTunnel.In);
>
> function ThreeCanvas() {
>   return (
>     <Canvas>
>       <WeaverTunnel.Out />
>       <Preload all />
>     </Canvas>
>  );
> }
> ```

For example, a box inside a DOM element:
```tsx
function DOMBox() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div ref={container}>
      <SceneSync attach={container} trackingMode="relaxed">
        <Box />
      </SceneSync>
    </div>
  );
}
```

There are many varible and options for you to play with, including a layout update callback, where it will report back what changes it have made to the scene, you can overlay many scenes together with the hud option, we have documented the details in the component itself, be sure to check it out.

`SceneSync` is compatible with `BakeScene`, `BakeScene` works based on the responsiveness of the site, so no worries :D
