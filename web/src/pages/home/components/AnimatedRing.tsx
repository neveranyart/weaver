import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { animate } from 'motion';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Mesh, Path, Shape } from 'three';

export default function AnimatedRing(props: { index: number }) {
  const pageRendered = useWeaverRouting('pageRendered');
  const mesh = useRef<Mesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    mesh.current?.geometry.center();

    if (!pageRendered) return;

    animate(
      mesh.current.rotation,
      { y: Math.PI / 2 + props.index * (Math.PI / 2 / 4) },
      {
        delay: 0.0 + props.index * 0.05,
        duration: 1,
        ease: [1, 0, 0, 1],
      }
    );

    animate(
      mesh.current.position,
      { x: 0 },
      {
        delay: 0.2 + props.index * 0.025,
        duration: 0.5,
        ease: [1, 0, 0, 1],
      }
    );

    animate(
      mesh.current.material,
      { opacity: 1 },
      {
        delay: 0.4 + props.index * 0.1,
        duration: 0,
      }
    );
  }, [pageRendered, props.index]);

  const arcShape = useMemo(() => {
    const arcShape = new Shape();

    arcShape.absarc(0, 0, 1, 0, Math.PI * 2, false);
    arcShape.holes.push(new Path().absarc(0, 0, 0.8, 0, Math.PI * 2, true));

    return arcShape;
  }, []);

  return (
    <mesh
      ref={mesh}
      rotation={[0, Math.PI / 2, 0]}
      position={[1 * (props.index + 1) * 0.5, 0, 0]}
    >
      <extrudeGeometry
        args={[
          arcShape,
          {
            steps: 1,
            bevelEnabled: false,
            curveSegments: 32,
            depth: 0.4,
          },
        ]}
      />
      <meshBasicMaterial
        color={props.index % 2 ? '#757575' : '#2b2b2b'}
        wireframe={!!(props.index % 2)}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
