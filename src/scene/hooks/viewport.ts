import { useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera } from 'three';

/**
 * Get current threejs viewport with the actual current.
 */
export function useViewport(
  customCamera?: OrthographicCamera | PerspectiveCamera
) {
  const { viewport, camera } = useThree();

  return {
    width: viewport.getCurrentViewport(customCamera ?? camera).width,
    height: viewport.getCurrentViewport(customCamera ?? camera).height,
  };
}
