# Scene
A `@react-three/*` focused sub-package for syncing, incorporating with DOM elements.

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

Since it will then send into a list of components managed by the tunnel, a key prop is required.

For example, a `BakeScene` with a box and a default camera:
```tsx
<BakeScene
  onSceneReady={() => {}}
  sceneKey="homeSceneObjs"
>
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

Create a DOM element, and pass its ref to `SceneSync`, put your 3D scene inside of `SceneSync`. And that scene will get synced with
that DOM element, there are multiple ways for you to decide on how a scene should be synced.

The component works by creating a group, containing your scene, and position the group along with user scroll, or frame-based positioning.

Since it will then send into a list of components managed by the tunnel, a key prop is required.

`SceneSync` is compatible with `BakeScene`, `BakeScene` works based on the responsiveness of the site, so no worries :D

> [!CAUTION]
> Limitations:
> - You can initialize any type of camera, but in no way you should move/rotate it.
> - `SceneSync` assumes all objects are at `z=0`, so if you move the `control` group/mesh, it will look off, unless it's an `OrthographicCamera`.

> [!NOTE]
> For `SceneSync`'s `relaxed` mode to work, you can provide a lenis instance since DOM scroll events buffers a bit, other modes doesn't require it:
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
      <SceneSync
        sceneKey={props.sceneKey}
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

There are many varible and options for you to play with, please read the documentation that we already put inside the component's props.

```ts
interface SyncProps {
  /**
   * This key is used for your objects passed into R3F.
   *
   * The components will be passed into the same tunnel, so the key here must be unique across pages.
   */
  sceneKey: string;

  /**
   * HTML element ref that `<SceneSync />` will use to sync with the scene.
   *
   * ```tsx
   * <div ref={container} />
   * <SceneSync attach={container}>
   *   <group />
   * </SceneSync>
   * ```
   */
  attach: RefObject<HTMLElement | null>;

  /**
   * `<SceneSync />` will depend on this variable to adjust how it should update.
   *
   * There are 3 modes: `relaxed`, `balanced` and `aggressive`.
   *
   * For each mode, there will be some very distinct trade-offs:
   *
   * - `relaxed`: Uses IntersectionObserver paired with lenis hook, together with ResizeObserver.
   *    - (+): Minimal update calls, best performance.
   *    - (-): The scene get desynced the moment DOM element moves without changing its sizes.
   *           When the scene bleeds out of the DOM element too much, if IntersectionObserver reported that the DOM element
   *           is out of view, the part of the scene that did not fully moved out of view will stay there.
   * - `balanced`: Uses IntersectionObserver paired with frame-based update, together with ResizeObserver.
   *    - (+): Just enough update calls to allow the DOM element to move freely while maintain aceptable performance.
   *    - (-): It will update on every frame when the object gets into view as reported by IntersectionObserver. And the same
   *           problem with `relaxed` mode when the scene bleeds out too much.
   * - `aggressive`: Frame-based update only. This mode is like how `<View />` from `@react-three/drei` kepts track of DOM elements.
   *    - (+): Designed for precise element <-> scene updates. Can't be desynced, if desynced, that's a bug.
   *    - (-): This is frame-based. It will fire updates as long as the scene is still mounted. Too many scenes with this
   *           mode enabled is not a good idea. Acceptable amount would be 3 scenes with this mode.
   *
   * Best of both worlds is `balanced` mode, for simpler scenes that doesn't change its position, `relaxed` should be used.
   */
  trackingMode: 'relaxed' | 'balanced' | 'aggressive';

  /**
   * This variable allows fine-grain control over your scene when passed to `<SceneSync />`.
   *
   * `<SceneSync />` will use its own ref and group when creating your scene to control its scale and position.
   * Setting this variable will disable the internal ref, and you can decide on which object gets controlled.
   *
   * This variable is needed for `hud` if you wanted to add a custom camera.
   *
   * For listening to change details, use `onLayoutChange` instead.
   */
  control?: RefObject<Group | Mesh | null>;

  /**
   * When this variable is set, `<SceneSync />` will send updates when the scene update its positions.
   *
   * The function return the calculated DOM rect, with dimension and position in 3D measurements.
   */
  onLayoutUpdate?: (
    rect: DOMRect,
    dimension: { w: number; h: number },
    position: { x: number; y: number }
  ) => void;

  /**
   * Enable/disable automatic scaling on the scene.
   *
   * Default: `true`
   *
   * This variable will also enable/disable: `scalingMode`, `scaleFactor`.
   */
  autoScaling?: boolean;

  /**
   * `<SceneSync />` calculates scaling based on the scene itself, but there are many scenarios that you want to do with your scene.
   *
   * So scaling has 4 modes for you to use, all 4 modes allows your objects to bleed out of the DOM element, but it varies from each modes,
   * but when you intentionally want that, the most stable one is `blind` mode:
   *
   * - `estimate`: The default. Adjust the scaling around the on mount measurements of the scene.
   * - `accurate`: The most demanding one, it will always measure the scene before applying scaling, making sure that the scene
   * scales correctly according to the DOM element, **DOESN'T WORK WITH `relaxed` TRACKING MODE**.
   * - `blind`: Assumes your scene is a 1, 1, 1 square, and adjust the scaling around that.
   * - `stretch`: Do not keep correct scaling, just fill the scene with the DOM element's bounding.
   */
  scalingMode?: 'estimate' | 'accurate' | 'blind' | 'stretch';

  /**
   * Sometimes, the scaling calculated might be larger/smaller than the scene provided.
   *
   * Unused when `scalingMode` is set to `accurate`.
   */
  scaleFactor?: number;

  /**
   * Enable/disable automatic positioning on the scene.
   *
   * Default: `true`
   */
  autoPositioning?: boolean;

  /**
   * Set a custom `rootMargin` for `IntersectObserver`.
   *
   * Will get ignored on `aggressive` tracking mode.
   */
  rootMargin?: string;

  /**
   * Set a custom tunnel for `<SceneSync />` send the components to for this scene only.
   *
   * Which is useful for example, put the objects inside a container in the scene.
   *
   * To set a default tunnel, pass it to `setDefaulTunnel` before use.
   */
  tunnelIn?: BasicTunnelIn;

  children?: ReactNode;
}

interface HudProps extends SyncProps {
  /**
   * Use `Hud` for this scene or not.
   *
   * This is useful when you want to apply custom camera for this scene, or renders multiple scenes on top of each other.
   *
   * To use a custom camera, pass a Drei's camera to `camera` variable, ensure that it has `makeDefault` set to true.
   *
   * To use the parent's default camera, pass `null` to `camera` variable.
   *
   * Example with a custom `OrthographicCamera`:
   * ```tsx
   * const control = useRef<Group>(null);
   *
   * return (
   *   <SceneSync
   *     hud
   *     renderPriority={1}
   *     camera={<OrthographicCamera makeDefault zoom={100} position={[0, 0, 5]} />}
   *   >
   *     <Box />
   *   </SceneSync>
   * );
   * ```
   */
  hud: true;

  /**
   * Provide your own camera, set to null to use the parent's camera.
   */
  camera: ReactElement | null;

  /**
   * Set the `renderPriority` to render things for `Hud`.
   */
  renderPriority: number;
}

interface NormalProps extends SyncProps {
  hud?: false;
}
```
