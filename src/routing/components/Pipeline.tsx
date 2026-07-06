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
export default function Pipeline(props: PipelineProps) {
  const { children, ...restOfProps } = props;

  return (
    <>
      <RouteHandler {...restOfProps} />
      {children}
    </>
  );
}

function RouteHandler(props: Omit<PipelineProps, 'children'>) {
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
    if (routeIdentifier !== props.identifier) {
      return;
    }

    if (props.contentReady !== undefined && !props.contentReady) {
      return;
    }

    if (!navigating && !pageRendered) {
      if (props.lenisUsage !== false) {
        weaverContext.lenis?.start();
      }

      setPageRendered(true);
      setActiveIdentifier(props.identifier);

      if (props.debugName)
        console.log(`[${props.debugName}] Renderer status: Mounted`);
    }
  }, [
    navigating,
    pageRendered,
    props.contentReady,
    props.debugName,
    props.identifier,
    props.lenisUsage,
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
    document.title = props.title;
    setActivePipeline(props.identifier);
  }, [props.identifier, props.title, setActivePipeline]);

  useEffect(
    () => () => {
      /**
       * Is the clean up event about navigation.
       *
       *
       * If `routeIdentifier` !== our identifier, it's probably a good idea to clean things up.
       */
      if (routeIdentifier === props.identifier) return;

      /**
       * When unmounted, stop lenis to pass control to another Pipline instance.
       */
      if (routeIdentifier !== props.identifier && props.lenisUsage !== false) {
        weaverContext.lenis?.stop();
        weaverContext.lenis?.scrollTo(0, {
          immediate: true,
          force: true,
        });
      }

      if (props.debugName)
        console.log(`[${props.debugName}] Renderer status: Unmounted`);
    },
    [
      props.debugName,
      props.identifier,
      props.lenisUsage,
      routeIdentifier,
      weaverContext.lenis,
    ]
  );

  return null;
}
