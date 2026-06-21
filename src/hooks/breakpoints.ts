import { useCallback, useState } from 'react';
import { useScreenCallback } from './screenCallback';

/**
 * A screen size hook to change components when media-query isn't viable. For example, swap out
 * components when screen gets too small, changing layout of a 3D scene to match the size.
 *
 * The value passed in must be sorted in ascending order.
 *
 * The hooks return where the screen size belong inbetween, for example:
 *
 * ```
 * Input:   " 640 768 1024 1280 1536 "
 *           |   |   |    |    |    |
 * Returns:  0   1   2    3    4    5
 * ```
 *
 * @param breakpoints Default value is TailwindCSS's screen sizes:
 * `[640, 768, 1024, 1280, 1536]`
 *
 * @returns A number from `0` to `breakpoints.length + 1` depends on screen sizes.
 */
export function useBreakpoints(
  breakpoints: number[] = [640, 768, 1024, 1280, 1536]
) {
  const getBreakpoint = useCallback(
    (width: number) => {
      let result = breakpoints!.length;
      for (let index = 0; index < breakpoints!.length; index++) {
        if (width < breakpoints![index]) {
          result = index;
          break;
        }
      }

      return result;
    },
    [breakpoints]
  );

  const [breakAt, setBreakAt] = useState<number>(
    getBreakpoint(window.innerWidth)
  );

  const breakpointCheck = useCallback(
    (latest: { width: number; height: number }) => {
      const result = getBreakpoint(latest.width);
      if (result !== breakAt) {
        setBreakAt(result);
      }
    },
    [breakAt, getBreakpoint]
  );
  useScreenCallback(breakpointCheck);

  return breakAt;
}
