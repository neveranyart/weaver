import type Lenis from 'lenis';
import { createContext } from 'react';
import type { BasicTunnelIn } from '.';

export interface WeaverContextProps {
  readonly lenis?: Lenis;
  readonly canvasTunnel?: BasicTunnelIn;
}

export const WeaverContext = createContext<WeaverContextProps>({});
