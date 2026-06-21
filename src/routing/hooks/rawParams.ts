import { useLocation } from 'react-router';

/**
 * Routing hook. This hook updates and splits pathname on location change.
 *
 * Great for creating custom routes on the fly under the same parent `Pipeline`.
 */
export function useRawParams(): (string | undefined)[] {
  const { pathname } = useLocation();

  return pathname.split('/').filter((param) => param !== '');
}
