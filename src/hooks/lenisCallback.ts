import { type RefObject, useCallback, useLayoutEffect } from 'react';
import { weaverSetup } from '../setup';
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
  if (!weaverSetup._lenisInstance) {
    throw Error(
      "`useLenisCallback` won't work without a lenis instance. Provide one via weaverSetup.setLenisInstance or `useCrollCallback` instead."
    );
  }

  const callbackWrapScroll = useCallback(
    () => callback(weaverSetup._lenisInstance!.actualScroll, 'scroll'),
    [callback]
  );
  const callbackWrapResize = useCallback(
    () => callback(weaverSetup._lenisInstance!.actualScroll, 'resize'),
    [callback]
  );

  useOrbit({
    target: options?.intersectOn as RefObject<HTMLElement | null> | undefined,
    events: {
      onIntersect(entry) {
        callbackWrapScroll();
        if (entry.isIntersecting) {
          weaverSetup._lenisInstance!.on('scroll', callbackWrapScroll);
          window.addEventListener('resize', callbackWrapResize, {
            passive: true,
          });
        } else {
          weaverSetup._lenisInstance!.off('scroll', callbackWrapScroll);
          window.removeEventListener('resize', callbackWrapResize);
        }
      },
    },
    rootMargin: '50% 0px 50% 0px',
  });

  useLayoutEffect(() => {
    if (!options?.intersectOn) {
      weaverSetup._lenisInstance!.on('scroll', callbackWrapScroll);
      window.addEventListener('resize', callbackWrapResize, { passive: true });
    }

    if (options?.initialCall) {
      callback(weaverSetup._lenisInstance!.actualScroll, 'initialize');
    }

    return () => {
      weaverSetup._lenisInstance!.off('scroll', callbackWrapScroll);
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
