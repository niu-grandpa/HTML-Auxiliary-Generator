import { useCallback, useEffect, useRef } from 'react';

/**
 * useDrag
 * @description 为元素绑定拖拽事件和计算其移动位置
 * @param {HTMLElement} target 被拖拽的目标元素
 * @param {HTMLElement} parent 目标元素的父节点，提供可移动范围空间
 * @param {Function} callback
 */
export function useDrag(
  target: HTMLElement,
  parent: HTMLElement,
  callback: (x: number, y: number) => void
) {
  const targetRef = useRef(target);
  const parentRef = useRef(parent);
  const callbackRef = useRef(callback);

  const dragging = useCallback((event: MouseEvent) => {
    const x = event.clientX - targetRef.current.offsetWidth / 2;
    const y = event.clientY - targetRef.current.offsetHeight / 2;
    // 计算是否最大边界溢出
    callbackRef.current?.(x, y);
  }, []);

  const draggStar = useCallback(() => {
    parentRef.current.addEventListener('mousemove', dragging);
  }, [dragging]);

  const dragEnd = useCallback(() => {
    parentRef.current.removeEventListener('mousemove', dragging);
    targetRef.current.removeEventListener('mouseup', dragEnd);
  }, [dragging]);

  useEffect(() => {
    targetRef.current.addEventListener('mousedown', draggStar);
    targetRef.current.addEventListener('mousedown', dragEnd);
  }, [target, parent, dragEnd, draggStar, dragging]);
}
