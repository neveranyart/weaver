import DelayedOutlet from './components/DelayedOutlet';
import Pipeline from './components/Pipeline';
import { useWeaverRoutingContext, WeaverRoutingContextGetter } from './context';
import { useNavigateAnchor } from './hooks/navigateAnchor';
import { useRawParams } from './hooks/rawParams';

/// A read-only state for reacting with changes reflected by weaver.
export const useWeaverRoutingState = (
  givenState: keyof WeaverRoutingContextGetter
) => {
  const state = useWeaverRoutingContext((state) => state[givenState]);
  return state;
};

export { useNavigateAnchor, useRawParams };

export { DelayedOutlet, Pipeline };
