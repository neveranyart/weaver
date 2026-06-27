/* eslint-disable react-refresh/only-export-components */

import type Lenis from 'lenis';
import { createContext, useMemo, type ReactNode } from 'react';

export type BasicTunnelIn = ({ children }: { children?: ReactNode }) => null;

export interface WeaverContextProps {
  readonly lenis?: Lenis;
  readonly canvasTunnel?: BasicTunnelIn;
}

export const WeaverContext = createContext<WeaverContextProps>({});

export default function WeaverProvider(
  props: WeaverContextProps & { children?: ReactNode }
) {
  const memoContext: WeaverContextProps = useMemo(
    () => ({
      lenis: props.lenis,
      canvasTunnel: props.canvasTunnel,
    }),
    [props.canvasTunnel, props.lenis]
  );
  return <WeaverContext value={memoContext}>{props.children}</WeaverContext>;
}
