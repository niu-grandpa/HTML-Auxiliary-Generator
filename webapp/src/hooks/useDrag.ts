import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getIsTargetNode } from '../utils';

export function useDrag(refElem: HTMLElement | null, targetKeyName: string) {
  const shiftX = useRef(0);
  const shiftY = useRef(0);
  const targetRef = useRef<HTMLElement | null>(null);
  const callbackRef = useRef<(x: number, y: number, key: string) => void>();
  // 计算出来的元素x坐标是相对于画布的，
  // 因此当导出元素的x坐标需加上此画布损失的右边距整个浏览器剩余的宽度比值
  // 公式：{targetX + [targetX / [(bodyW - wrapperW) / 100)]]}
  const calcPos = useCallback(
    (clientX: number, clientY: number) => {
      const originX = clientX - shiftX.current;
      const originY = clientY - shiftY.current;

      const { parentElement } = targetRef.current!;
      const { left: parentX, top: parentY } =
        parentElement!.getBoundingClientRect();

      const { offsetWidth: targetW, offsetHeight: targetH } =
        targetRef.current!;

      const rightBound = refElem!.offsetWidth - targetW;
      const bottomBound = refElem!.offsetHeight - targetH;

      let x = originX - parentX;
      let y = originY - parentY;

      originX < 0 && (x = 0);
      originY < 0 && (y = 0);
      originX > rightBound && (x = rightBound - parentX);
      originY > bottomBound && (y = bottomBound - parentY);

      return { x, y };
    },
    [refElem]
  );

  const moveAt = useCallback((x: number, y: number) => {
    targetRef.current!.style.translate = `${x}px ${y}px`;
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
      callbackRef.current?.(x, y, targetRef.current.dataset[targetKeyName]!);
      moveAt(x, y);
    },
    [calcPos, moveAt, handleStopEvent, targetKeyName]
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
