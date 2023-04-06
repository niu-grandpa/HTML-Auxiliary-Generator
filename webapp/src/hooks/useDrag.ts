import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getIsTargetNode } from '../utils';

export function useDrag(
  refElem: HTMLElement | null,
  targetDatasetName: string
) {
  const targetRef = useRef<HTMLElement | null>(null);
  const shiftX = useRef(0);
  const shiftY = useRef(0);
  const callbackRef = useRef<(x: number, y: number, key: string) => void>();
  // 计算元素落下的位置。
  // 输出的结果是按照百分比转换的，解决在画布导出代码后，
  // 能根据浏览器窗口适应实际位置，而不是固定在画布上的位置。
  const calcPos = useCallback((clientX: number, clientY: number) => {
    const { parentElement } = targetRef.current!;
    const {
      left: parentLeft,
      top: parentTop,
      width: parentWidth,
      height: parentHeight,
    } = parentElement!.getBoundingClientRect();

    let x = clientX - parentLeft - shiftX.current;
    let y = clientY - parentTop - shiftY.current;
    x < 0 && (x = 0);
    y < 0 && (y = 0);

    const rightBound = parentWidth - targetRef.current!.offsetWidth;
    const bottomBound = parentHeight - targetRef.current!.offsetHeight;
    x > rightBound && (x = rightBound);
    y > bottomBound && (y = bottomBound);

    x = x / parentWidth / 0.01;
    y = y / parentHeight / 0.01;

    return { x, y };
  }, []);

  const moveAt = useCallback((x: number, y: number) => {
    targetRef.current!.style.top = `${y}%`;
    targetRef.current!.style.left = `${x}%`;
    targetRef.current = null;
  }, []);

  const handleStopEvent = useCallback((event: DragEvent) => {
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'move';
    event.dataTransfer!.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      handleStopEvent(event);
    },
    [handleStopEvent]
  );

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      handleStopEvent(event);
      const target = event.target as HTMLElement;
      const res = getIsTargetNode(target);
      if (!res) return false;
      targetRef.current = res;
      shiftX.current = event.clientX - res.getBoundingClientRect().left;
      shiftY.current = event.clientY - res.getBoundingClientRect().top;
    },
    [handleStopEvent]
  );

  const handleDragDrop = useCallback(
    (event: DragEvent) => {
      handleStopEvent(event);
      if (!targetRef.current) return false;
      const { x, y } = calcPos(event.clientX, event.clientY);
      callbackRef.current?.(x, y, targetRef.current.dataset['dragVnodeUuid']!);
      moveAt(x, y);
    },
    [calcPos, moveAt, handleStopEvent]
  );

  const activeHandler = useCallback(() => {
    if (!refElem) return;
    refElem.addEventListener('dragstart', handleDragStart);
    refElem.addEventListener('dragenter', handleStopEvent);
    refElem.addEventListener('dragover', handleDragOver);
    refElem.addEventListener('drop', handleDragDrop);
    return () => {
      refElem.removeEventListener('dragstart', handleDragStart);
      refElem.removeEventListener('dragenter', handleStopEvent);
      refElem.removeEventListener('dragover', handleDragOver);
      refElem.removeEventListener('drop', handleDragDrop);
    };
  }, [
    refElem,
    handleDragStart,
    handleStopEvent,
    handleDragOver,
    handleDragDrop,
  ]);

  useEffect(activeHandler, [activeHandler]);

  const returnValue = useMemo(
    () => ({
      onDragComplete: (
        callback: (x: number, y: number, key: string) => void
      ) => {
        callbackRef.current = callback;
      },
    }),
    []
  );

  return returnValue;
}
