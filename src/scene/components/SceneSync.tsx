/* eslint-disable react-hooks/immutability */
import { Hud } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Box3, Group, Mesh, Vector3 } from 'three';
import { type BasicTunnelIn } from '../../';
import { WeaverContext } from '../../context';
import { useLayoutEffectOnce } from '../../hooks/effectOnce';
import { useLenisCallback } from '../../hooks/lenisCallback';
import { useOrbit } from '../../hooks/orbit';
import { useScrollCallback } from '../../hooks/scrollCallback';
import { useViewport } from '../hooks/viewport';

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
   * This variable allows fine-grain control over your scene when passed to `<SceneSync />`.
   *
   * `<SceneSync />` will use its own ref and group when creating your scene to control its scale and position.
   * Setting this variable will disable the internal ref, and you can decide on which object gets controlled.
   *
   * For listening to change details, use `onLayoutChange` instead.
   */
  control?: RefObject<Group | Mesh | null>;

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
   * but when you intentionally want that, the most stable one is `box` mode:
   *
   * - `box`: Assumes your scene is a square, and adjust the scaling around that, it allows 3D scene to massively overflow the element.
   * - `stretch`: Do not keep correct scaling, just fill the scene with the DOM element's bounding, great fit for drei's `<Image />`.
   * - `estimate`: Adjust the scaling around the on mount measurements of the scene. Compatible with all 3 tracking modes.
   * - `accurate`: Not compatible with `relaxed` tracking mode. It will always remeasure the scene before applying scaling,
   * making sure that the scene scales correctly according to the DOM element, **DOESN'T WORK WITH `relaxed` TRACKING MODE**.
   *
   * The default scaling mode is `box`, .
   */
  scalingMode?: 'box' | 'stretch' | 'estimate' | 'accurate';

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
   * `<SceneSync />` will look for a provided tunnel if the variable is not set.
   *
   * Set a custom tunnel for `<SceneSync />` send the components to for this scene only.
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

/**
 * A core part of an in-house tool called `weaver`.
 *
 * A component to allow three.js scene to track and sync with DOM element.
 */
export default function SceneSync(props: NormalProps | HudProps) {
  const weaverContext = useContext(WeaverContext);

  if (props.trackingMode === 'relaxed' && !weaverContext.lenis) {
    console.warn(
      'Due to how DOM event listener works for scrolling. The scene might lags behind with the actual current scroll progress. For the best user experience, use Lenis and provide an instance via `<WeaverProvider />` before mounting any `<SceneSync />`.'
    );
  }

  const TunnelIn = props.tunnelIn ?? weaverContext.canvasTunnel;

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

function SyncInternal({
  attach,
  control,
  trackingMode = 'relaxed',
  autoScaling = true,
  scalingMode = 'box',
  scaleFactor = 1,
  autoPositioning = true,
  rootMargin,
  children,
  onLayoutUpdate,
}: SyncProps) {
  const weaverContext = useContext(WeaverContext);
  const viewport = useViewport();

  const defaultControl = useRef<Group>(null);

  const activeControl = control ?? defaultControl;

  const sceneBox = useMemo(() => new Box3(), []);
  const sceneBounding = useMemo(() => new Vector3(), []);

  const mountBounding = useMemo(() => new Vector3(), []);

  useLayoutEffect(() => {
    if (
      !activeControl.current ||
      scalingMode === 'box' ||
      scalingMode === 'stretch'
    )
      return;
    sceneBox.setFromObject(activeControl.current);
    sceneBox.getSize(sceneBounding);

    if (mountBounding.equals({ x: 0, y: 0, z: 0 })) {
      mountBounding.copy(sceneBounding);
    }
  }, [activeControl, mountBounding, scalingMode, sceneBounding, sceneBox]);

  const scalingMethods = useMemo(
    () => ({
      box(
        scene: RefObject<Group | Mesh | null>,
        w: number,
        h: number,
        scaleFactor: number
      ) {
        if (!scene.current) return;

        const scale = Math.min(w, h) * scaleFactor;
        scene.current.scale.set(scale, scale, scale);
      },
      stretch(
        scene: RefObject<Group | Mesh | null>,
        w: number,
        h: number,
        scaleFactor: number
      ) {
        if (!scene.current) return;

        scene.current.scale.set(
          w * scaleFactor,
          h * scaleFactor,
          Math.min(w, h) * scaleFactor
        );
      },
      estimate(
        scene: RefObject<Group | Mesh | null>,
        w: number,
        h: number,
        scaleFactor: number
      ) {
        if (!scene.current) return;

        const scale =
          Math.min(w / mountBounding.x, h / mountBounding.y) * scaleFactor;

        scene.current.scale.set(scale, scale, scale);
      },
      accurate(
        scene: RefObject<Group | Mesh | null>,
        w: number,
        h: number,
        scaleFactor: number
      ) {
        if (!scene.current) return;

        sceneBox.setFromObject(scene.current);
        sceneBox.getSize(sceneBounding);

        const scale =
          Math.min(
            w / (sceneBounding.x / scene.current.scale.x),
            h / (sceneBounding.y / scene.current.scale.y)
          ) * scaleFactor;

        scene.current.scale.set(scale, scale, scale);
      },
    }),
    [mountBounding.x, mountBounding.y, sceneBounding, sceneBox]
  );

  const updatePosition = useCallback(() => {
    if (!activeControl.current || !attach.current) return;

    const domRect = attach.current.getBoundingClientRect();
    const scroll = weaverContext.lenis?.actualScroll ?? window.scrollY;

    const vpWidthRatio = viewport.width / window.innerWidth;
    const vpHeightRatio = viewport.height / window.innerHeight;
    const vpScroll = scroll * vpHeightRatio;

    const w = domRect.width * vpWidthRatio;
    const h = domRect.height * vpHeightRatio;

    const x = domRect.x * vpWidthRatio + w * 0.5 - viewport.width * 0.5;
    const y =
      viewport.height * 0.5 -
      (domRect.y + scroll) * vpHeightRatio -
      h * 0.5 +
      vpScroll;

    onLayoutUpdate?.(domRect, { w, h }, { x, y });

    if (autoPositioning !== false) {
      activeControl.current.position.x = x;
      activeControl.current.position.y = y;
    }

    if (autoScaling !== false) {
      scalingMethods[scalingMode](activeControl, w, h, scaleFactor);
    }
  }, [
    activeControl,
    attach,
    autoPositioning,
    autoScaling,
    onLayoutUpdate,
    scaleFactor,
    scalingMethods,
    scalingMode,
    viewport.height,
    viewport.width,
    weaverContext.lenis?.actualScroll,
  ]);

  /**
   * Update position when function changes.
   */
  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  const mode = {
    relaxed: weaverContext.lenis ? (
      <RelaxedUpdateLenis
        attach={attach}
        updatePosition={updatePosition}
        rootMargin={rootMargin}
      />
    ) : (
      <RelaxedUpdateDom
        attach={attach}
        updatePosition={updatePosition}
        rootMargin={rootMargin}
      />
    ),
    balanced: (
      <BalancedUpdate
        attach={attach}
        updatePosition={updatePosition}
        rootMargin={rootMargin}
      />
    ),
    aggressive: <AggressiveUpdate updatePosition={updatePosition} />,
  };

  if (control) {
    return (
      <>
        {children}
        {mode[trackingMode]}
      </>
    );
  }

  return (
    <group ref={defaultControl}>
      {children}
      {mode[trackingMode]}
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
