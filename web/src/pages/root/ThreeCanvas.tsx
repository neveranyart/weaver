import { Preload } from '@react-three/drei';
import { Canvas, events } from '@react-three/fiber';
import { GlobalTunnel } from '../../context';
import { lenisInstance } from '../../lenisInstance';

export default function ThreeCanvas() {
  return (
    <Canvas
      eventSource={document.body}
      events={(state) => ({
        ...events(state),

        /**
         * The `eventSource` is set to `document.body`, but `<Canvas />` only fills the viewport,
         * when body is scrollable, the pointer input got offsetted, the compute function here is to
         * adjust for scroll height.
         */
        compute: (event, state) => {
          const adjustedY = event.offsetY - lenisInstance.actualScroll;
          state.pointer.set(
            (event.offsetX / state.size.width) * 2 - 1,
            -(adjustedY / state.size.height) * 2 + 1
          );
          state.raycaster.setFromCamera(state.pointer, state.camera);
        },
      })}
      gl={{ localClippingEnabled: true, alpha: true }}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <GlobalTunnel.Canvas.Out />
      <Preload all />
    </Canvas>
  );
}
