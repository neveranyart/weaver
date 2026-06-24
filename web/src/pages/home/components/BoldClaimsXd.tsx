import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { motion } from 'motion/react';

export default function BoldClaimsXd() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <motion.p
      className="font-semibold text-xl tracking-[0.01rem]"
      initial={{ translateY: '-50%', opacity: 0 }}
      animate={{
        translateY: pageRendered ? '0%' : '-100%',
        opacity: pageRendered ? 1 : 0,
      }}
      transition={{
        opacity: { duration: 0, delay: 1.125 },
        duration: 0.5,
        delay: 0.9,
        ease: [0.75, 0, 0.15, 1],
      }}
    >
      Focus on the art, we'll handle the rest.
    </motion.p>
  );
}
