import { SceneSync } from '@neveranyart/weaver/scene';
import { Cylinder, MeshTransmissionMaterial } from '@react-three/drei';
import { useRef, type ReactNode } from 'react';

export default function Hero() {
  return (
    <section className="relative w-full h-dvh flex flex-col gap-4">
      <Playground />
      <Title />
    </section>
  );
}

function Playground() {
  return (
    <div className="w-full h-full grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Sector sceneKey={`hero${index}`}>
          <Cylinder args={[1, 1, 0.4]} rotation={[0, 0, Math.PI / 2 + ((index + 1) * 0.15)]}>
            {!(index % 2) ? (
              <meshBasicMaterial color="white" wireframe />
            ) : (
              <MeshTransmissionMaterial />
            )}
          </Cylinder>
        </Sector>
      ))}
    </div>
  );
}

function Sector(props: { sceneKey: string; children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      className="w-full h-full border-b border-t border-[black]/40"
    >
      <SceneSync
        attach={container}
        trackingMode="relaxed"
        sceneKey={props.sceneKey}
        scaleFactor={0.5}
      >
        {props.children}
      </SceneSync>
    </div>
  );
}

function Title() {
  return (
    <div className="w-full h-52 grid grid-cols-2 gap-4 items-end">
      <p className="text-[7.5rem] font-[PlayfairDisplay] font-semibold trim ml-1 mb-1">
        {'Weaver'.split('').map((value, index) => (
          <span key={index}>{value}</span>
        ))}
      </p>
      <p className="font-semibold text-xl tracking-[0.01rem] ml-1">
        Focus on the art, we'll handle the rest.
      </p>
    </div>
  );
}
