import { Pipeline } from '@neveranyart/weaver/routing';
import { BakeScene } from '@neveranyart/weaver/scene';
import { PerspectiveCamera } from '@react-three/drei';
import { useState } from 'react';

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <Pipeline
      title="Weaver: Depth"
      debugName="Depth"
      identifier="Depth"
      contentReady={sceneReady}
      lenisUsage
    >
      <BakeScene
        onSceneReady={() => setSceneReady(true)}
        sceneKey="depthSceneObjs"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      </BakeScene>
    </Pipeline>
  );
}
