import { useEffect, useLayoutEffect } from 'react';

/**
 * Effect to run once on mount/unmount, ignore all cautions.
 *
 * Strict mode still make this effect runs twice, but never by a state change.
 *
 * Used for initialization, clean up.
 */
export function useEffectOnce(callback: React.EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}

/**
 * Effect to run once on mount/unmount, ignore all cautions.
 *
 * Strict mode still make this effect runs twice, but never by a state change.
 *
 * Used for initialization, clean up.
 */
export function useLayoutEffectOnce(callback: React.EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(callback, []);
}
