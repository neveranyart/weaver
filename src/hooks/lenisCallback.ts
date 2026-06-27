import {
  type RefObject,
  useCallback,
  useContext,
  useLayoutEffect,
} from 'react';
import { WeaverContext } from '../context';
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
 * A lenis scroll hook.
 *
 * This hook calls many time and repeated. Update states inside this hook carefully to avoid performance issues.
 */
export function useLenisCallback(
  callback: (latest: number, reason: ScrollCallbackReason) => void,
  options?: HookOptions
) {
  const weaverContext = useContext(WeaverContext);

  if (!weaverContext.lenis) {
    throw Error(
      "`useLenisCallback` won't work without a lenis instance. Provide one via weaverSetup.setLenisInstance or `useCrollCallback` instead."
    );
  }

  const callbackWrapScroll = useCallback(
    () => callback(weaverContext.lenis!.actualScroll, 'scroll'),
    [callback, weaverContext.lenis]
  );
  const callbackWrapResize = useCallback(
    () => callback(weaverContext.lenis!.actualScroll, 'resize'),
    [callback, weaverContext.lenis]
  );

  useOrbit({
    target: options?.intersectOn as RefObject<HTMLElement | null> | undefined,
    events: {
      onIntersect(entry) {
        callbackWrapScroll();
        if (entry.isIntersecting) {
          weaverContext.lenis!.on('scroll', callbackWrapScroll);
          window.addEventListener('resize', callbackWrapResize, {
            passive: true,
          });
        } else {
          weaverContext.lenis!.off('scroll', callbackWrapScroll);
          window.removeEventListener('resize', callbackWrapResize);
        }
      },
    },
    rootMargin: '50% 0px 50% 0px',
  });

  useLayoutEffect(() => {
    if (!options?.intersectOn) {
      weaverContext.lenis!.on('scroll', callbackWrapScroll);
      window.addEventListener('resize', callbackWrapResize, { passive: true });
    }

    if (options?.initialCall) {
      callback(weaverContext.lenis!.actualScroll, 'initialize');
    }

    return () => {
      weaverContext.lenis!.off('scroll', callbackWrapScroll);
      window.removeEventListener('resize', callbackWrapResize);
    };
  }, [
    callback,
    callbackWrapResize,
    callbackWrapScroll,
    options?.initialCall,
    options?.intersectOn,
    weaverContext.lenis,
  ]);
}
