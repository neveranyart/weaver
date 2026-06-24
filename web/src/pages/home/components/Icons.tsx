import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { motion } from 'motion/react';
import GithubLogo from './Githublogo';
import NeveranyLogo from './NeveranyLogo';

export default function Icons() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <motion.div
      className="h-7 flex gap-2 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <a
        href="https://github.com/neveranyart/weaver"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubLogo className="h-7 w-7" fill="black" />
      </a>
      <a
        href="https://github.com/neveranyart"
        target="_blank"
        rel="noopener noreferrer"
      >
        <NeveranyLogo className="h-6 w-6" fill="black" expand={pageRendered} />
      </a>
    </motion.div>
  );
}
