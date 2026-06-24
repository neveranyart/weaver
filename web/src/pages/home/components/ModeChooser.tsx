import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { motion } from 'motion/react';
import type { Dispatch, SetStateAction } from 'react';

export default function ModeChooser(props: {
  scalingMode: 'estimate' | 'accurate';
  setScalingMode: Dispatch<SetStateAction<'estimate' | 'accurate'>>;
}) {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <motion.p
      className="translate-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <motion.span
        className="select-none cursor-pointer"
        onClick={() => props.setScalingMode('estimate')}
        initial={{ opacity: 1 }}
        animate={{ opacity: props.scalingMode === 'estimate' ? 1 : 0.5 }}
        transition={{ duration: 0.1 }}
      >
        estimate
      </motion.span>
      {' / '}
      <motion.span
        className="select-none cursor-pointer"
        onClick={() => props.setScalingMode('accurate')}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: props.scalingMode === 'accurate' ? 1 : 0.5 }}
        transition={{ duration: 0.1 }}
      >
        accurate
      </motion.span>
    </motion.p>
  );
}
