import { type ReactNode, useMemo } from 'react';
import { type WeaverContextProps, WeaverContext } from './context';

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
