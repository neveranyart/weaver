import { Hud } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, {
  ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Group } from 'three';
import { useLayoutEffectOnce } from '../../hooks/effectOnce';
import { useLenisCallback } from '../../hooks/lenisCallback';
import { useOrbit } from '../../hooks/orbit';
import { useScrollCallback } from '../../hooks/scrollCallback';
import { BasicTunnelIn, weaverSetup } from '../../setup';
import { useViewport } from '../hooks/viewport';

export type Basic3DTransforms = {
  scale: {
    set: (x: number, y: number, z: number) => void;
  };
  position: {
    x: number;
    y: number;
  };
};

interface SyncProps {
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
   * This variable allows fine-grain control over your scene when passed to `<SceneSync />`.
   *
   * `<SceneSync />` will use its own ref and group when creating your scene to control its scale and position.
   * Setting this variable will disable the internal ref, and you can decide on which object gets controlled.
   *
   * This variable is needed for `hud` if you wanted to add a custom camera.
   *
   * For listening to change details, use `onLayoutChange` instead.
   */
  control?: RefObject<Basic3DTransforms | null>;

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
  hud?: boolean;

  /**
   * Control the scene's scaling when positioning.
   */
  scaleFactor?: number;

  /**
   * `<SceneSync />` avoid stretching the object by using the smallest dimension of the DOM element.
   *
   * This variable will tell `<SceneSync />` to stretch it anyways.
   */
  stretch?: boolean;

  /**
   * Disable automatic scaling on the scene.
   *
   * This variable will also disable any scaling settings like `stretch` and `scaleFactor`.
   */
  disableScaling?: boolean;

  /**
   * Disable automatic positioning on the scene.
   */
  disablePositioning?: boolean;

  /**
   * `<SceneSync />` will depend on this variable to adjust how it should update.
   *
   * There are 3 modes: `relaxed`, `balanced` and `aggressive`.
   *
   * For each mode, there will be some very distinct trade-offs
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
   * Enable this variable to automatically update events for `@react-three/fiber`, allowing precise raycast.
   *
   * Default: `false`
   */
  autoUpdateEvents?: boolean;

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

  /**
   * This key is used for your objects passed into R3F.
   *
   * The components will be passed into the same tunnel, so the key here must be unique across pages.
   */
  sceneKey: string;

  children: ReactNode;
}

interface HudProps extends SyncProps {
  hud: true;

  /**
   * Provide your own camera, set to null to use the parent's camera.
   */
  camera: ReactElement | null;

  /**
   * Set the `renderPriority` to render things for `Hud`.
   *
   * This variable is ignored when `hud` is not `true`.
   */
  renderPriority: number;
}

interface NormalProps extends SyncProps {
  hud?: false;
}

/**
 * A core part of an in-house tool called `weaver`.
 *
 * A component to allow three objects to track and sync with DOM element.
 *
 * The component uses `<Hud />` under the "hud", so if you want to use more than one `<SceneSync />`,
 * you must set `renderPriority`. If not, the component will render the last scene pushed through React.
 */
export default function SceneSync(props: NormalProps | HudProps) {
  if (props.trackingMode === 'relaxed' && !weaverSetup._lenisInstance) {
    console.warn(
      'Due to how DOM event listener works for scrolling. The scene might fall behind with the actual current scroll progress. For the best user experience, use lenis and provide the instance using weaverSetup.setLenisInstance() before mounting any `SceneSync`.'
    );
  }

  const TunnelIn = props.tunnelIn ?? weaverSetup._Default3DTunnelIn;

  if (!TunnelIn) {
    throw Error(
      'Failed to find a tunnel to use. Consider setting a default tunnel.'
    );
  }

  if (props.hud) {
    return (
      <TunnelIn>
        <Hud key={props.sceneKey} renderPriority={props.renderPriority}>
          {props.camera !== null ? props.camera : <HudCameraHandler />}
          <SyncInternal {...props} />
        </Hud>
      </TunnelIn>
    );
  }

  return (
    <TunnelIn>
      <SyncInternal key={props.sceneKey} {...props} />
    </TunnelIn>
  );
}

function SyncInternal(props: SyncProps) {
  const viewport = useViewport();

  const defaultControl = useRef<Group>(null);
  const {
    attach,
    control,
    scaleFactor,
    stretch,
    disableScaling,
    disablePositioning,
    autoUpdateEvents,
    onLayoutUpdate,
  } = props;

  const threeEvents = useThree((state) => state.events);

  const activeControl = control ?? defaultControl;

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const updatePosition = useCallback(() => {
    if (!activeControl.current || !attach.current) return;

    const domRect = attach.current.getBoundingClientRect();
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;
    const scroll = weaverSetup._lenisInstance?.actualScroll ?? window.scrollY;

    const vpWidthRatio = viewport.width / screenW;
    const vpHeightRatio = viewport.height / screenH;

    const scrollOffset = (scroll / screenH) * viewport.height;

    const w = domRect.width * vpWidthRatio;
    const h = domRect.height * vpHeightRatio;

    const x = domRect.x * vpWidthRatio + w * 0.5 - viewport.width * 0.5;
    const y =
      viewport.height * 0.5 -
      (domRect.y + scroll) * vpHeightRatio -
      h * 0.5 +
      scrollOffset;

    if (onLayoutUpdate) {
      onLayoutUpdate(domRect, { w, h }, { x, y });
    }

    const unwrapedScaleFactor = scaleFactor ?? 1;

    if (!disableScaling) {
      if (!stretch) {
        const minScale = Math.min(w, h) * unwrapedScaleFactor;
        activeControl.current.scale.set(minScale, minScale, minScale);
      } else {
        activeControl.current.scale.set(
          w * unwrapedScaleFactor,
          h * unwrapedScaleFactor,
          Math.min(w, h) * unwrapedScaleFactor
        );
      }
    }

    if (!disablePositioning) {
      // eslint-disable-next-line react-hooks/immutability
      activeControl.current.position.x = x;
      activeControl.current.position.y = y;
    }

    if (autoUpdateEvents && threeEvents.update) {
      threeEvents.update();
    }
  }, [
    activeControl,
    attach,
    autoUpdateEvents,
    disablePositioning,
    disableScaling,
    onLayoutUpdate,
    scaleFactor,
    stretch,
    threeEvents,
    viewport.height,
    viewport.width,
  ]);

  /**
   * Update position when function changes.
   */
  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  const mode = {
    relaxed: weaverSetup._lenisInstance ? (
      <RelaxedUpdateLenis
        attach={props.attach}
        updatePosition={updatePosition}
        rootMargin={props.rootMargin}
      />
    ) : (
      <RelaxedUpdateDom
        attach={props.attach}
        updatePosition={updatePosition}
        rootMargin={props.rootMargin}
      />
    ),
    balanced: (
      <BalancedUpdate
        attach={props.attach}
        updatePosition={updatePosition}
        rootMargin={props.rootMargin}
      />
    ),
    aggressive: <AggressiveUpdate updatePosition={updatePosition} />,
  };

  if (props.control) {
    return (
      <>
        {props.children}
        {mode[props.trackingMode]}
      </>
    );
  }

  return (
    <group ref={defaultControl}>
      {props.children}
      {mode[props.trackingMode]}
    </group>
  );
}

function HudCameraHandler() {
  const getHudState = useThree((state) => state.get);
  const { previousRoot } = useThree();
  const { camera: rootCamera } = previousRoot!();

  useLayoutEffect(() => {
    getHudState().set({ camera: rootCamera });
  }, [getHudState, rootCamera]);

  return null;
}

function RelaxedUpdateDom(props: {
  attach: RefObject<HTMLElement | null>;
  updatePosition: () => void;
  rootMargin?: string;
}) {
  const { updatePosition } = props;

  /**
   * Scroll hook to update object correctly to the current HTML scroll position.
   */
  useScrollCallback(updatePosition, {
    initialCall: true,
    intersectOn: props.attach,
  });

  /**
   * Allows the element to resize too.
   */
  useOrbit({
    target: props.attach,
    events: {
      onResize: updatePosition,
    },
    rootMargin: props.rootMargin,
  });

  useLayoutEffectOnce(updatePosition);
  return null;
}

function RelaxedUpdateLenis(props: {
  attach: RefObject<HTMLElement | null>;
  updatePosition: () => void;
  rootMargin?: string;
}) {
  const { updatePosition } = props;

  /**
   * Scroll hook to update object correctly to the current HTML scroll position.
   */
  useLenisCallback(updatePosition, {
    initialCall: true,
    intersectOn: props.attach,
  });

  /**
   * Allows the element to resize too.
   */
  useOrbit({
    target: props.attach,
    events: {
      onResize: updatePosition,
    },
    rootMargin: props.rootMargin,
  });

  useLayoutEffectOnce(updatePosition);
  return null;
}

function BalancedUpdate(props: {
  attach: RefObject<HTMLElement | null>;
  updatePosition: () => void;
  rootMargin?: string;
}) {
  const [shouldUpdate, setShouldUpdate] = useState(false);

  useOrbit({
    target: props.attach,
    events: {
      onIntersect(entry) {
        setShouldUpdate(entry.isIntersecting);
      },
      onResize: props.updatePosition,
    },
    rootMargin: props.rootMargin,
  });

  if (shouldUpdate) {
    return <FrameUseCallback callback={props.updatePosition} />;
  }

  return null;
}

function AggressiveUpdate(props: { updatePosition: () => void }) {
  return <FrameUseCallback callback={props.updatePosition} />;
}

function FrameUseCallback(props: { callback: () => void }) {
  useFrame(() => props.callback());
  return null;
}
