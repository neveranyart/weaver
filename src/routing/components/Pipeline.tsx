import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useMatches } from 'react-router';
import { WeaverContext } from '../../context';
import { useWeaverRoutingContext } from '../context';

interface PipelineProps {
  children?: ReactNode;

  /**
   * A state switch to notifies `Pipeline` that the content and elements of the page is ready to be displayed.
   *
   * Usually, you will need to preload some other external sources, or initialize 3D scene, this state
   * make sure that the loading fallback doesn't mess up and show initializing stuff.
   *
   * Using `BakeScene`, you can ensure that the scene is loaded via its callback, you can then pass the state value that
   * `BakeScene` changes to this variable to hide all the lags behind loading screen.
   */
  contentReady?: boolean;

  /**
   * Title for the page.
   */
  title: string;

  /**
   * This is crucial for different `Pipeline`s to differentiate each other and avoiding conflict.
   *
   * Example for parent path: `/`, `/about`, `/projects`,...
   */
  identifier: string;

  /**
   * Callback to know when the `<Pipeline />` is mounted.
   *
   * "Mounted" here means the `<Pipeline />` finished taking over.
   *
   * So it can be triggered multiple times even though your component is still in its lifecycle.
   *
   * One example of that happening is when the user rapidly switching routes.
   */
  onMounted?: () => void;

  /**
   * If provided, `Pipeline` will log the current phase to console.
   */
  debugName?: string;

  /**
   * This is the only feature where weaver will use lenis to directly manipulate scrolling behaviour.
   *
   * By default, this value is `true` when a lenis instance is provided.
   *
   * `Pipeline` will stop and start lenis automatically when this variable is `true`.
   *
   * Disable this feature to gains complete control over lenis when mounting/unmounting to handle however you want.
   */
  lenisUsage?: boolean;
}

/**
 * A core part of an in-house tool called `weaver`.
 *
 * `Pipeline`: Notifies & reflect changes to/from `LoadingFallback`
 * and `DelayedOutlet` about its page loading status.
 *
 * All parent routes must have `Pipeline` in order to work and sync with `DelayedOutlet`.
 */
export default function Pipeline({ children, ...props }: PipelineProps) {
  return (
    <>
      <RouteHandler {...props} />
      {children}
    </>
  );
}

function RouteHandler({
  contentReady,
  debugName,
  identifier,
  onMounted,
  lenisUsage,
  title,
}: Omit<PipelineProps, 'children'>) {
  const weaverContext = useContext(WeaverContext);

  const matches = useMatches();
  const routeIdentifier = useMemo(() => {
    const handle = matches[matches.length - 1].handle as {
      identifier?: string;
    };

    if (!handle || !handle.identifier) {
      throw Error(
        "A `handle` with `identifier` string wasn't provided to the `Pipeline` route."
      );
    }

    return handle.identifier;
  }, [matches]);

  const navigating = useWeaverRoutingContext((state) => state.navigating);
  const pageRendered = useWeaverRoutingContext((state) => state.pageRendered);

  const setActivePipeline = useWeaverRoutingContext(
    (state) => state.setActivePipeline
  );
  const setPageRendered = useWeaverRoutingContext(
    (state) => state.setPageRendered
  );
  const setActiveIdentifier = useWeaverRoutingContext(
    (state) => state.setActiveIdentifier
  );

  const updater = useCallback(() => {
    // Don't touch anything if it's not even yours.
    if (routeIdentifier !== identifier) {
      return;
    }

    if (contentReady !== undefined && !contentReady) {
      return;
    }

    if (!navigating && !pageRendered) {
      if (lenisUsage !== false) {
        weaverContext.lenis?.start();
      }

      setPageRendered(true);
      setActiveIdentifier(identifier);

      onMounted?.();

      if (debugName) console.info(`[${debugName}] Renderer status: Mounted`);
    }
  }, [
    navigating,
    pageRendered,
    contentReady,
    debugName,
    identifier,
    lenisUsage,
    onMounted,
    routeIdentifier,
    setActiveIdentifier,
    setPageRendered,
    weaverContext.lenis,
  ]);

  useLayoutEffect(() => {
    updater();

    const syncTask = setInterval(updater, 50);

    return () => {
      clearInterval(syncTask);
    };
  }, [updater]);

  useEffect(() => {
    document.title = title;
    setActivePipeline(identifier);
  }, [identifier, title, setActivePipeline]);

  useEffect(
    () => () => {
      /**
       * Is the clean up event about navigation.
       *
       *
       * If `routeIdentifier` !== our identifier, it's probably a good idea to clean things up.
       */
      if (routeIdentifier === identifier) return;

      /**
       * When unmounted, stop lenis to pass control to another Pipline instance.
       */
      if (routeIdentifier !== identifier && lenisUsage !== false) {
        weaverContext.lenis?.stop();
        weaverContext.lenis?.scrollTo(0, {
          immediate: true,
          force: true,
        });
      }

      if (debugName) console.info(`[${debugName}] Renderer status: Unmounted`);
    },
    [debugName, identifier, lenisUsage, routeIdentifier, weaverContext.lenis]
  );

  return null;
}
