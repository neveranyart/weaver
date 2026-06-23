import { motion } from 'motion/react';
import type { JSX } from 'react';

export default function NeveranyLogo(
  props: JSX.IntrinsicElements['svg'] & {
    fill: string;
    expand: boolean;
    duration?: number;
    delay?: number;
  }
) {
  const { fill, expand, delay, duration, ...domProps } = props;

  return (
    <svg {...domProps} viewBox="0 0 456 456" fill="none">
      <motion.path
        d="M201.795 456V0H254.208V456H201.795Z"
        fill={fill}
        initial={{ rotate: expand ? 0 : 90 }}
        animate={{ rotate: expand ? 0 : 90 }}
        transition={{
          ease: [0.3, 0.3, 0, 1],
          duration: duration ?? 1,
          delay,
        }}
      />
      <motion.path
        d="M85.3113 48.2483L407.752 370.689L370.69 407.751L48.2491 85.3105L85.3113 48.2483Z"
        fill={fill}
        initial={{ rotate: expand ? 0 : 135 }}
        animate={{ rotate: expand ? 0 : 135 }}
        transition={{
          ease: [0.3, 0.3, 0, 1],
          duration: duration ?? 1,
          delay,
        }}
      />
      <motion.path
        d="M0 201.793L456 201.793V254.207H0V201.793Z"
        fill={fill}
        initial={{ rotate: expand ? 0 : 180 }}
        animate={{ rotate: expand ? 0 : 180 }}
        transition={{
          ease: [0.3, 0.3, 0, 1],
          duration: duration ?? 1,
          delay,
        }}
      />
      <motion.path
        initial={{ rotate: expand ? 0 : 225 }}
        animate={{ rotate: expand ? 0 : 225 }}
        transition={{
          ease: [0.3, 0.3, 0, 1],
          duration: duration ?? 1,
          delay,
        }}
        d="M107.838 403.621H52.3779V348.162H107.838V403.621ZM163.297 348.162H107.838V292.703H163.297V348.162ZM348.162 163.296H292.703V107.837H348.162V163.296ZM403.622 107.837H348.162V52.3774H403.622V107.837Z"
        fill={fill}
      />
    </svg>
  );
}
