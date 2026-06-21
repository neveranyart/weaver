import type Lenis from 'lenis';
import { ReactNode } from 'react';

export type BasicTunnelIn = ({ children }: { children: ReactNode }) => null;

declare global {
  var __weaverLenis: Lenis | undefined;
  var __weaver3DTunnel: BasicTunnelIn | undefined;
}

class WeaverSetup {
  /**
   * This variable is handled internally by weaver. **Do not use**.
   */
  get _lenisInstance(): Lenis | undefined {
    return globalThis.__weaverLenis;
  }
  set _lenisInstance(val: Lenis | undefined) {
    globalThis.__weaverLenis = val;
  }

  /**
   * This variable is handled internally by weaver. **Do not use**.
   */
  get _Default3DTunnelIn(): BasicTunnelIn | undefined {
    return globalThis.__weaver3DTunnel;
  }
  set _Default3DTunnelIn(val: BasicTunnelIn | undefined) {
    globalThis.__weaver3DTunnel = val;
  }

  setLenisInstance(instance: Lenis) {
    this._lenisInstance = instance;
  }
  set3DTunnel(tunnelIn: BasicTunnelIn) {
    this._Default3DTunnelIn = tunnelIn;
  }
}

export const weaverSetup = new WeaverSetup();
