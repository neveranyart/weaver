import { create } from 'zustand/react';

export interface WeaverRoutingContextGetter {
  /**
   * Current active parent, **AFTER** Pipeline has finished rendering, so the `activeParent`
   * will be delayed.
   */
  activeIdentifier: string;

  /**
   * This is **not based on URL**, it's based on which `Pipeline` has access to the the site.
   */
  activePipeline: string;

  /**
   * `DelayedOutlet` special variable, indicating if the route is current transitioning to a new route or not.
   */
  navigating: boolean;

  /**
   * When the page is rendered, it will turns this to true,
   * any parent page navigation will causes this to goes false, set to false in `DelayedOulet`.
   *
   * It's set to `false` right after `navigating` is set to `true`. `true` statement will be handled by `Pipeline`.
   */
  pageRendered: boolean;
}

interface WeaverRoutingContextSetter {
  setActiveIdentifier: (activeIdentifier: string) => void;
  setActivePipeline: (activePipeline: string) => void;
  setNavigating: (navigating: boolean) => void;
  setPageRendered: (pageRendered: boolean) => void;
}

export const useWeaverRoutingContext = create<
  WeaverRoutingContextSetter & WeaverRoutingContextGetter
>()((set) => ({
  activeIdentifier: '',
  setActiveIdentifier: (activeIdentifier) => set({ activeIdentifier }),

  activePipeline: '',
  setActivePipeline: (activePipeline) => set({ activePipeline }),

  navigating: true,
  setNavigating: (navigating) => set({ navigating }),

  pageRendered: false,
  setPageRendered: (pageRendered) => set({ pageRendered }),
}));
