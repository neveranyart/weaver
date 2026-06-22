import { useLayoutEffectOnce } from '@neveranyart/weaver/hooks';

export default function NotFound() {
  useLayoutEffectOnce(() => {
    window.location.href = '/';
  });
  return <></>;
}
