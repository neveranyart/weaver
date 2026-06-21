import { useLayoutEffect, useState } from 'react';

/**
 * A reflect on one self.
 *
 * This hook keeps a version of a state that has data, if the value is undefined or null, the hook doesn't change.
 *
 * If the value doesn't have data at first, reflect won't have data, only when value have actual data, it will get recorded.
 */
export default function useReflect<T>(value: T | null | undefined) {
  const [reflect, setReflect] = useState(value);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (value) {
        setReflect(value);
      }
    });
  }, [value]);

  return reflect;
}
