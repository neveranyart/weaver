import { Pipeline } from '@neveranyart/weaver/routing';
import { BakeScene } from '@neveranyart/weaver/scene';
import { OrthographicCamera } from '@react-three/drei';
import { useState } from 'react';
import Hero from '../pages/home/Hero';
import Weave from '../pages/home/components/Weave';

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <Pipeline
      title="Weaver"
      debugName="Home"
      identifier="Home"
      contentReady={sceneReady}
    >
      <Weave />
      <Hero />
      <BakeScene
        onSceneReady={() => setSceneReady(true)}
        sceneKey="homeSceneObjs"
      >
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
      </BakeScene>
    </Pipeline>
  );
}
