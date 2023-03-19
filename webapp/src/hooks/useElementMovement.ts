import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * useElementMovement
 *
 * 该钩子用于通过对元素进行鼠标按下加跟随鼠标移动
 */
export function useElementMovement(): (ref: MutableRefObject<HTMLElement>) => void {
  const refElem = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (refElem !== null) {
      console.log('active');
    }
  }, [refElem]);

  const activeHandler = useCallback((ref: MutableRefObject<HTMLElement>) => {
    refElem.current = ref.current;
  }, []);

  return useMemo(() => activeHandler, [activeHandler]);
}
