import {
  useWeaverRoutingContext,
  type WeaverRoutingContextGetter,
} from '../context';

/**
 * A read-only state for reacting with changes reflected by weaver.
 */
export function useWeaverRouting<K extends keyof WeaverRoutingContextGetter>(
  key: K
): WeaverRoutingContextGetter[K] {
  const state = useWeaverRoutingContext((state) => state[key]);
  return state;
}
