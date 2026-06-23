import { useWeaverRouting } from '@neveranyart/weaver/routing';
import { SceneSync } from '@neveranyart/weaver/scene';
import { animate } from 'motion';
import { motion } from 'motion/react';
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Mesh, MeshBasicMaterial, Path, Shape } from 'three';
import NeveranyLogo from './NeveranyLogo';

export default function Hero() {
  return (
    <section className="relative w-full h-dvh flex flex-col gap-4">
      <TopIcon />
      <Playground />
      <Title />
    </section>
  );
}

function TopIcon() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <motion.div
      className="fixed top-2 right-2 h-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <NeveranyLogo className="h-7 w-7" fill="black" expand={pageRendered} />
    </motion.div>
  );
}

function Playground() {
  return (
    <div className="w-full h-full grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Sector sceneKey={`hero${index}`}>
          <AnimatedCylinder index={index} />
        </Sector>
      ))}
    </div>
  );
}

function AnimatedCylinder(props: { index: number }) {
  const pageRendered = useWeaverRouting('pageRendered');
  const mesh = useRef<Mesh>(null);

  useLayoutEffect(() => {
    if (!pageRendered) return;
    animate(0, 1, {
      onUpdate(latest) {
        if (!mesh.current) return;
        mesh.current.rotation.y = Math.PI / 2 + props.index * (Math.PI / 2 / 4) * latest;
      },
      delay: 0.5 + props.index * 0.05,
      duration: 1,
      ease: [1, 0, 0, 1],
    });

    animate(1 * (props.index + 1), -0.2, {
      onUpdate(latest) {
        if (!mesh.current) return;
        mesh.current.position.x = latest;
      },
      delay: 0.7 + props.index * 0.025,
      duration: 0.5,
      ease: [1, 0, 0, 1],
    });

    animate(0, 1, {
      onUpdate(latest) {
        if (!mesh.current) return;
        (mesh.current.material as MeshBasicMaterial).opacity = latest;
      },
      delay: 0.9 + props.index * 0.1,
      duration: 0,
    });
  }, [pageRendered]);

  const arcShape = useMemo(() => {
    const arcShape = new Shape();

    arcShape.absarc(0, 0, 1, 0, Math.PI * 2, false);
    arcShape.holes.push(new Path().absarc(0, 0, 0.8, 0, Math.PI * 2, true));

    return arcShape;
  }, []);

  return (
    <mesh ref={mesh}>
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
      ></extrudeGeometry>
      <meshBasicMaterial
        color={props.index % 2 ? '#757575' : '#2b2b2b'}
        wireframe={!!(props.index % 2)}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

function Sector(props: { sceneKey: string; children: ReactNode }) {
  const pageRendered = useWeaverRouting('pageRendered');
  const container = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={container}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: pageRendered ? 1 : 0 }}
    >
      <SceneSync
        attach={container}
        trackingMode="relaxed"
        sceneKey={props.sceneKey}
      >
        {props.children}
      </SceneSync>
    </motion.div>
  );
}

function Title() {
  const pageRendered = useWeaverRouting('pageRendered');

  return (
    <div className="w-full grid grid-cols-4 gap-4 items-end overflow-clip">
      <h1 className="text-[7cqi] font-[PlayfairDisplay] font-semibold trim ml-1 mb-1 text-nowrap">
        {'Weaver'.split('').map((value, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ translateY: '100%' }}
            animate={{ translateY: pageRendered ? '0%' : '100%' }}
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
      <div />
      <motion.p
        className="font-semibold text-xl tracking-[0.01rem] ml-1"
        initial={{ translateY: '-50%', opacity: 0 }}
        animate={{
          translateY: pageRendered ? '0%' : '-100%',
          opacity: pageRendered ? 1 : 0,
        }}
        transition={{
          opacity: { duration: 0, delay: 1.725 },
          duration: 0.5,
          delay: 1.5,
          ease: [0.75, 0, 0.15, 1],
        }}
      >
        Focus on the art, we'll handle the rest.
      </motion.p>
    </div>
  );
}
