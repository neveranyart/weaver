import { DelayedOutlet } from '@neveranyart/weaver/routing';
import ThreeCanvas from '../pages/root/ThreeCanvas';

export default function Root() {
  return (
    <main className="min-h-screen">
      <ThreeCanvas />
      <DelayedOutlet delay={100} />
    </main>
  );
}
