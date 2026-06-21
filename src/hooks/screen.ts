import { useCallback, useLayoutEffect, useState } from 'react';

/**
 * A state-based screen hook. It will change its state on resize.
 */
export function useScreen() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const setScreen = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, []);

  useLayoutEffect(() => {
    window.addEventListener('resize', setScreen, { passive: true });

    return () => {
      window.removeEventListener('resize', setScreen);
    };
  }, [setScreen]);

  return { width: width, height: height };
}
