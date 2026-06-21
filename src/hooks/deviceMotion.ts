import { useLayoutEffect } from 'react';

/**
 * A niche API, use it with hooks like `useMouseCallback` to ensure compatibility.
 */
export function useDeviceMotion(
  callback: (details: DeviceMotionEvent) => void
) {
  useLayoutEffect(() => {
    window.addEventListener('devicemotion', callback, { passive: true });
    return () => window.removeEventListener('devicemotion', callback);
  });
}
