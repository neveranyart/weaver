import { useState, type Dispatch, type SetStateAction } from 'react';
import AnimatedRing from './components/AnimatedRing';
import BoldClaimsXd from './components/BoldClaimsXd';
import Icons from './components/Icons';
import ModeChooser from './components/ModeChooser';
import PackageName from './components/PackageName';
import Sector from './components/Sector';

export default function Hero() {
  const [scalingMode, setScalingMode] = useState<'estimate' | 'accurate'>(
    'estimate'
  );

  return (
    <section className="relative w-full h-dvh flex flex-col gap-4">
      <Playground scalingMode={scalingMode} />
      <Title scalingMode={scalingMode} setScalingMode={setScalingMode} />
    </section>
  );
}

function Playground(props: { scalingMode: 'estimate' | 'accurate' }) {
  return (
    <div className="w-full h-full grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Sector
          key={`hero${index}${props.scalingMode}`}
          sceneKey={`hero${index}${props.scalingMode}`}
          scalingMode={props.scalingMode}
        >
          <AnimatedRing index={index} />
        </Sector>
      ))}
    </div>
  );
}

function Title(props: {
  scalingMode: 'estimate' | 'accurate';
  setScalingMode: Dispatch<SetStateAction<'estimate' | 'accurate'>>;
}) {
  return (
    <div className="w-full grid grid-cols-4 gap-4 items-end overflow-clip">
      <PackageName />
      <div />
      <BoldClaimsXd />
      <div className="flex justify-between font-medium">
        <ModeChooser {...props} />
        <Icons />
      </div>
    </div>
  );
}
