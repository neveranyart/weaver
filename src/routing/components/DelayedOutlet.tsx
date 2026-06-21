import {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMatches, useOutlet } from 'react-router';
import { useWeaverRoutingContext } from '../context';

/**
 * A core part of an in-house tool called `weaver`.
 *
 * Delaying the routing process from `react-router`, handles gracefully between `Pipeline`s
 * while allowing any loading fallback component to listen and react with event changes.
 */
export default function DelayedOutlet(props: { delay: number }) {
  const matches = useMatches();
  const routeIdentifier = useMemo(() => {
    const handle = matches[matches.length - 1].handle as {
      identifier?: string;
    };

    if (!handle || !handle.identifier) {
      throw Error(
        "A `handle` with `identifier` string wasn't provided to the `Pipeline` route via `react-router`."
      );
    }

    return handle.identifier;
  }, [matches]);

  const activePipeline = useWeaverRoutingContext(
    (state) => state.activePipeline
  );
  const setNavigating = useWeaverRoutingContext((state) => state.setNavigating);
  const setPageRendered = useWeaverRoutingContext(
    (state) => state.setPageRendered
  );

  const renderPageTask = useRef(setTimeout(() => {}));
  const routerOutlet = useOutlet();

  const [renderer, setRenderer] = useState<ReactNode>(null);

  // Handle and update new parent page.
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    if (routeIdentifier === activePipeline) {
      // Avoid while changing page, cancelling before new page pushed in
      // cause `activePipeline` to not change, making `navigating` softlock.
      setNavigating(false);
      return;
    }

    setNavigating(true);
    setPageRendered(false);

    renderPageTask.current = setTimeout(() => {
      setRenderer(routerOutlet!);
      setNavigating(false);
    }, props.delay);

    return () => {
      /**
       * Clear invalid task that were scheduled last effect.
       */
      clearInterval(renderPageTask.current);
    };
  }, [
    activePipeline,
    props.delay,
    routeIdentifier,
    routerOutlet,
    setNavigating,
    setPageRendered,
  ]);

  return renderer;
}
