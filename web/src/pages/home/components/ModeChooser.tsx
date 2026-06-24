import { motion } from 'motion/react';
import type { Dispatch, SetStateAction } from 'react';

export default function ModeChooser(props: {
  scalingMode: 'estimate' | 'accurate';
  setScalingMode: Dispatch<SetStateAction<'estimate' | 'accurate'>>;
}) {
  return (
    <p className="translate-y-1">
      <motion.span
        className="select-none cursor-pointer"
        onClick={() => props.setScalingMode('estimate')}
        initial={{ opacity: 1 }}
        animate={{ opacity: props.scalingMode === 'estimate' ? 1 : 0.5 }}
      >
        estimate
      </motion.span>
      {' / '}
      <motion.span
        className="select-none cursor-pointer"
        onClick={() => props.setScalingMode('accurate')}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: props.scalingMode === 'accurate' ? 1 : 0.5 }}
      >
        accurate
      </motion.span>
    </p>
  );
}
