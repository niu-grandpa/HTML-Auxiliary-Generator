import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export function useDebounce<T>(callback: (...args: T[]) => T, wait = 200) {
  const timer = useRef<NodeJS.Timer>();
  const callbackRef = useRef<Function | null>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      callbackRef.current = null;
      if (!isEqual(timer.current, undefined)) {
        clearTimeout(timer.current);
        timer.current = undefined;
      }
    };
  }, []);

  const debounceFn = useCallback(
    (...args: T[]) => {
      if (!isEqual(timer.current, undefined)) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        clearTimeout(timer.current);
        callbackRef.current?.(...args);
      }, wait);
    },
    [wait]
  );

  return useMemo(() => debounceFn, [debounceFn]);
}
