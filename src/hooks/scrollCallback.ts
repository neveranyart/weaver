import { type RefObject, useCallback, useLayoutEffect } from 'react';
import { useOrbit } from './orbit';

interface HookOptions {
  /**
   * Hook will report when first initialized without waiting for scroll event to actually happens.
   */
  initialCall?: boolean;
  /**
   * Set an element to only call when the element is actually entering the viewport (with 25% `rootMargin`).
   */
  intersectOn?: RefObject<HTMLOrSVGElement | null>;
}

export type ScrollCallbackReason = 'resize' | 'scroll' | 'initialize';

/**
 * A DOM scroll hook.
 *
 * This hook calls many time and repeated. Update states inside this hook carefully to avoid performance issues.
 *
 * For manipulating elements matches closely with the actual scroll offet, consider use `lenis` and utilize `useLenisCallback`.
 */
export function useScrollCallback(
  callback: (latest: number, reason: ScrollCallbackReason) => void,
  options?: HookOptions
) {
  const callbackWrapScroll = useCallback(
    () => callback(window.scrollY, 'scroll'),
    [callback]
  );
  const callbackWrapResize = useCallback(
    () => callback(window.scrollY, 'resize'),
    [callback]
  );

  useOrbit({
    target: options?.intersectOn as RefObject<HTMLElement | null> | undefined,
    events: {
      onIntersect(entry) {
        callbackWrapScroll();
        if (entry.isIntersecting) {
          window.addEventListener('scroll', callbackWrapScroll, {
            passive: true,
          });
          window.addEventListener('resize', callbackWrapResize, {
            passive: true,
          });
        } else {
          window.removeEventListener('scroll', callbackWrapScroll);
          window.removeEventListener('resize', callbackWrapResize);
        }
      },
    },
    rootMargin: '50% 0px 50% 0px',
  });

  useLayoutEffect(() => {
    if (!options?.intersectOn) {
      window.addEventListener('scroll', callbackWrapScroll, { passive: true });
      window.addEventListener('resize', callbackWrapResize, { passive: true });
    }

    if (options?.initialCall) {
      callback(window.scrollY, 'initialize');
    }

    return () => {
      window.removeEventListener('scroll', callbackWrapScroll);
      window.removeEventListener('resize', callbackWrapResize);
    };
  }, [
    callback,
    callbackWrapResize,
    callbackWrapScroll,
    options?.initialCall,
    options?.intersectOn,
  ]);
}
