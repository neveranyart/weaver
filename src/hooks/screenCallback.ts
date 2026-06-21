import { useLayoutEffect } from 'react';

export interface ScreenCallbackValues {
  width: number;
  height: number;
}

type Callback = (props: ScreenCallbackValues) => void;

/**
 * A callback-based screen hook. Recommended.
 */
export function useScreenCallback(
  callback: Callback,
  options?: { initialCall?: boolean }
) {
  useLayoutEffect(() => {
    const reportScreen = () =>
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    // Call it first time when the hook was initialized.
    if (options?.initialCall) {
      reportScreen();
    }

    window.addEventListener('resize', reportScreen, { passive: true });

    return () => {
      window.removeEventListener('resize', reportScreen);
    };
  }, [callback, options?.initialCall]);
}
