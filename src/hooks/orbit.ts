import { type RefObject, useEffect } from 'react';

/**
 * A simple Orbit hook for ResizeObserver and IntersectionObserver.
 *
 * @param target HTML element ref to attach to.
 * @param events Specify which events should the orbit tracks.
 * @param rootMargin Adjust `rootMargin` option for `IntersectionObserver`.
 */
export function useOrbit(options: {
  target?: RefObject<HTMLElement | null>;
  events: {
    onResize?: (entry: ResizeObserverEntry) => void;
    onIntersect?: (entry: IntersectionObserverEntry) => void;
  };
  rootMargin?: string;
}) {
  const { onResize, onIntersect } = options.events;
  const { rootMargin = '25% 0px 25% 0px' } = options;

  useEffect(() => {
    if (!options.target || !options.target.current) {
      console.warn('Given DOM ref is empty', options.target);
      return;
    }

    let orbitResize = undefined;
    if (onResize) {
      orbitResize = new ResizeObserver((entries) => onResize(entries[0]));
      orbitResize.observe(options.target.current);
    }
    let orbitIntersect = undefined;
    if (onIntersect) {
      orbitIntersect = new IntersectionObserver(
        (entries) => onIntersect(entries[0]),
        { rootMargin }
      );
      orbitIntersect.observe(options.target.current);
    }

    return () => {
      orbitResize?.disconnect();
      orbitIntersect?.disconnect();
    };
  }, [onIntersect, onResize, rootMargin, options.target]);
}
