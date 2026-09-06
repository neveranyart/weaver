import { useProgress } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Fragment,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { type BasicTunnelIn } from '../../';
import { WeaverContext } from '../../context';

interface BakeSceneProps {
  /**
   * Objects to be passed into R3F.
   */
  children?: ReactNode;

  /**
   * Provide a custom tunnel, ignoring the default tunnel.
   */
  tunnelIn?: BasicTunnelIn;

  /**
   * Set a custom stable frame count target that the component deems as "stable".
   *
   * Adding more stable frame count target means that lower-end devices or an unstable device might wait a bit longer.
   *
   * Stable means: Current delta `<=` Average delta.
   *
   * Default: `30`
   */
  stableFramesTarget?: number;

  /**
   * Polyfill variable for WebKit (Safari) doesn't supports `requestIdleCallback`.
   *
   * This variable will be used for delaying the `setTimeout` on Safari browser.
   *
   * Default: 1000 (ms).
   */
  callbackTimeout?: number;

  /**
   * The timeout for `requestIdleCallback`.
   *
   * The task might get stuck in an infinite wait when the main thread is always busy, especially on low-end CPUs.
   *
   * Default: 5000 (ms).
   */
  waitIdleInterrupt?: number;

  /**
   * Whether to wait for network resource loading or not.
   *
   * Default: true.
   */
  waitForProgress?: boolean;

  /**
   * Reports back when the objects are ready to be displayed.
   */
  onSceneReady: () => void;

  /**
   * This key is used for your objects passed into R3F.
   *
   * The components will be passed into the same tunnel, so the key here must be unique across pages.
   */
  sceneKey: string;
}

/**
 * A core part of an in-house tool called `weaver`.
 *
 * `BakeScene`: This component will notifiy when the global 3D scene is ready.
 *
 * It works by using the `useFrame` from `@react-three/fiber` and watch the frame changes, getting its average frame counts,
 * and calculate the amount of stable frames, when the stable frame limit hit its target, a `requestIdleCallback` or `setTimeout` (for Safari)
 * will fire to avoid any surprise attacks from the scheduled works from the renderer.
 *
 * This component also accepts 3D elements `children` to be rendered directly to the canvas with some camera options.
 * But you don't have to put every 3D components inside the baker, for example, `SceneSync`s in the page are also
 * being watched by this component.
 *
 * The route renderer **CAN'T** detect if the page has 3D elements or not, so if a page uses any sort of 3D rendering,
 * this component **MUST** be a children iniside `Pipeline` (`index.tsx`), then pass the state value that bake changes
 * to `Pipeline`'s `contentReady` in order for the `BakeScene` to work behind loading fallback screen.
 */
export default function BakeScene(props: BakeSceneProps) {
  const { children, tunnelIn, ...passProps } = props;
  const weaverContext = useContext(WeaverContext);

  const TunnelIn = tunnelIn ?? weaverContext.canvasTunnel;

  if (!TunnelIn) {
    throw Error(
      'Failed to find a tunnel to use. Consider setting a default tunnel.'
    );
  }

  return (
    <TunnelIn>
      <Fragment key={props.sceneKey}>
        {children}
        <NotificationHandler {...passProps} />
      </Fragment>
    </TunnelIn>
  );
}

function NotificationHandler(
  props: Omit<BakeSceneProps, 'children' | 'tunnelIn'>
) {
  const [clearFrameHook, setClearFrameHook] = useState(false);
  /**
   * `useFrame` is expensive for something that only triggers once, so yea,
   * we'll remove the notifier as soon as the job is done.
   */
  return (
    !clearFrameHook && (
      <RenderNotifier
        {...props}
        onCallbackScheduled={() => setClearFrameHook(true)}
      />
    )
  );
}

function RenderNotifier({
  stableFramesTarget = 30,
  callbackTimeout = 1000,
  waitIdleInterrupt = 5000,
  waitForProgress = true,
  onCallbackScheduled,
  onSceneReady,
}: Omit<BakeSceneProps, 'children' | 'tunnelIn'> & {
  onCallbackScheduled: () => void;
}) {
  const { progress, active } = useProgress();
  const scheduledForCallback = useRef(false);

  const shuttle = useRef(0);
  const frameTime = useRef(0);
  const stableFrame = useRef(0);

  const requestIdleCallbackPolyfill = useMemo(() => {
    return (
      window.requestIdleCallback ||
      function (cb) {
        const start = Date.now();
        return setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => {
              return Math.max(0, 50 - (Date.now() - start));
            },
          });
        }, callbackTimeout);
      }
    );
  }, [callbackTimeout]);

  useFrame((_, delta) => {
    if (scheduledForCallback.current) return;
    if (waitForProgress && progress < 100 && active) return;

    shuttle.current++;
    frameTime.current += delta;
    const average = frameTime.current / shuttle.current;

    if (delta > average) return;
    stableFrame.current++;

    if (stableFrame.current < stableFramesTarget) return;

    scheduledForCallback.current = true;
    onCallbackScheduled();

    requestIdleCallbackPolyfill(onSceneReady, {
      timeout: waitIdleInterrupt,
    });
  });

  return null;
}
