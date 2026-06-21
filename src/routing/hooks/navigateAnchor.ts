import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/**
 * A hook to replace `<Link>` from `react-router`, attach the function to
 * `onClick` event of an anchor tag to overwrites its behavior.
 *
 * Example usage:
 * ```tsx
 * const navigator = useNavigateAnchor();
 *
 * return (
 *   <a href="/" onClick={navigator}>
 *     Navigate
 *   </a>
 * );
 * ```
 *
 * @param onNavigate Calls when a navigation event happens.
 * @param onSameRoute Calls when user is on the same route, no navigation happens.
 * @returns
 */
export function useNavigateAnchor(
  onNavigate?: () => void,
  onSameRoute?: () => void
) {
  const navigate = useNavigate();

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      const href = event.currentTarget.getAttribute('href');
      if (href) {
        if (onNavigate) {
          onNavigate();
        }

        if (href !== window.location.pathname) {
          navigate(event.currentTarget.getAttribute('href') ?? '');
        } else {
          if (onSameRoute) {
            onSameRoute();
          }
        }
      }
    },
    [onNavigate, navigate, onSameRoute]
  );
}
