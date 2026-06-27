import { type ReactNode } from 'react';
import WeaverProvider from './WeaverProvider';

export type BasicTunnelIn =
  | (({ children }: { children?: ReactNode }) => null)
  | (({ children }: { children: ReactNode }) => null);

export { WeaverProvider };
