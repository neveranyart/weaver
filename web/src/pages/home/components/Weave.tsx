import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { motion } from 'motion/react';

export default function Weave() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <motion.div
      className="fixed top-0 bottom-0 left-0 right-0 grid grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <div className="border-r border-[black]/40"></div>
      <div className="border-l border-r border-[black]/40"></div>
      <div className="border-l border-r border-[black]/40"></div>
      <div className="border-l border-[black]/40"></div>
    </motion.div>
  );
}
