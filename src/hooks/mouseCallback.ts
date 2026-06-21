import { type RefObject, useLayoutEffect } from 'react';
import { useOrbit } from './orbit';

interface HookOptions {
  /**
   * Set an element to only call when the element is actually entering the viewport (with 25% `rootMargin`).
   */
  intersectOn?: RefObject<HTMLOrSVGElement | null>;
}

/**
 * A DOM mouse hook.
 *
 * This hook calls many time and repeated. Update states inside this hook carefully to avoid performance issues.
 *
 */
export function useMouseCallback(
  callback: (latest: MouseEvent) => void,
  options?: HookOptions
) {
  useOrbit({
    target: options?.intersectOn as RefObject<HTMLElement | null> | undefined,
    events: {
      onIntersect(entry) {
        if (entry.isIntersecting) {
          window.addEventListener('mousemove', callback, { passive: true });
        } else {
          window.removeEventListener('mousemove', callback);
        }
      },
    },
    rootMargin: '50% 0px 50% 0px',
  });

  useLayoutEffect(() => {
    if (!options?.intersectOn) {
      window.addEventListener('mousemove', callback, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', callback);
    };
  }, [callback, options?.intersectOn]);
}
