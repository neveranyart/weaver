import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { motion } from 'motion/react';

export default function PackageName() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <h1 className="text-[7cqi] font-[PlayfairDisplay] font-semibold text-nowrap overflow-clip trim trim-start">
      {'Weaver'.split('').map((value, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ translateY: '100%' }}
          animate={{ translateY: pageRendered ? '20%' : '100%' }}
          transition={{
            duration: 0.75,
            delay: 0.025 * index,
            ease: [0.3, 0.3, 0, 1],
          }}
        >
          {value}
        </motion.span>
      ))}
    </h1>
  );
}
