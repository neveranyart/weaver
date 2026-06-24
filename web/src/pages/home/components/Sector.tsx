import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { SceneSync } from '@neveranyart/weaver/scene';
import { motion } from 'motion/react';
import { type ReactNode, useRef } from 'react';

export default function Sector(props: {
  sceneKey: string;
  scalingMode: 'estimate' | 'accurate';
  children: ReactNode;
}) {
  const pageRendered = useWeaverRouting('pageRendered');
  const container = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={container}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <SceneSync
        sceneKey={props.sceneKey}
        attach={container}
        trackingMode="balanced"
        scalingMode={props.scalingMode}
      >
        {props.children}
      </SceneSync>
    </motion.div>
  );
}
