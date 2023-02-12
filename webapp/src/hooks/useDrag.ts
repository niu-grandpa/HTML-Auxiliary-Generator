import { RefObject, useCallback, useEffect, useRef } from 'react';

/**
 * useDrag
 * @description 为元素绑定拖拽事件和计算其移动位置
 * @param {HTMLElement | null} target 被拖拽的目标元素
 * @param {HTMLElement | null} parent 目标元素的父节点，提供可移动范围空间
 * @param {Function} callback
 */
export function useDrag(
  target: RefObject<HTMLElement | null>,
  parent: RefObject<HTMLElement | null>,
  callback: (x: number, y: number) => void
) {
  const targetRef = useRef(target.current);
  const parentRef = useRef(parent.current);
  const callbackRef = useRef(callback);
  const dashedElm = useRef(document.createElement('div'));

  const createDashed = useCallback((elm: HTMLElement, x: number, y: number) => {
    if (dashedElm.current === null) {
      dashedElm.current = document.createElement('div');
    }
    const dashed = dashedElm.current;
    dashed.id = 'Move_Elm_Placeholder';
    dashed.style.width = `${elm.offsetWidth}px`;
    dashed.style.height = `${elm.offsetHeight}px`;
    dashed.style.transform = `translate(${x}px, ${y}px)`;
    dashed.style.boxShadow = '0 2px 0 rgb(0 0 0 / 2%)';
    dashed.style.border = '1px dashed #1677ff';
    elm.after(dashed);
  }, []);

  const destoryDashed = useCallback(() => {
    if (dashedElm.current === null) return;
    parentRef.current!.removeChild(dashedElm.current);
    dashedElm.current = null as any;
  }, []);

  const whenMouseDown = useCallback(
    (ev: MouseEvent) => {
      const { offsetLeft, offsetTop } = targetRef.current!;
      // 鼠标点击物体那一刻相对于物体左侧边框的
      // 距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
      const diffX = ev.clientX - offsetLeft;
      const diffY = ev.clientY - offsetTop;
      createDashed(targetRef.current!, offsetLeft, offsetTop);
      return [diffX, diffY];
    },
    [createDashed]
  );

  useEffect(() => {
    targetRef.current = target.current;
    parentRef.current = parent.current;

    if (targetRef.current === null && parentRef.current === null) return;

    const targetElm = targetRef.current!;
    const parentElm = parentRef.current!;

    const onMouseDown = (ev: MouseEvent) => {
      ev.stopPropagation();

      const [diffX, diffY] = whenMouseDown(ev);
      const onMouseMove = (ev: MouseEvent) => {
        ev.stopPropagation();
        let moveX = ev.clientX - diffX;
        let moveY = ev.clientY - diffY;
        if (moveX < 0) {
          moveX = 0;
        } else if (moveX > parentElm.offsetWidth - targetElm.offsetWidth) {
          moveX = parentElm.offsetWidth - targetElm.offsetWidth;
        }
        if (moveY < 0) {
          moveY = 0;
        } else if (moveY > parentElm.offsetHeight - targetElm.offsetHeight) {
          moveY = parentElm.offsetHeight - targetElm.offsetHeight;
        }
        callbackRef.current(moveX, moveY);
        targetElm.classList.add('view-opts-box-item-move');
      };

      const onCleanup = (ev: MouseEvent) => {
        ev.stopPropagation();
        destoryDashed();
        targetElm.classList.remove('view-opts-box-item-move');
        parentElm.removeEventListener('mousemove', onMouseMove);
        parentElm.removeEventListener('mouseleave', onCleanup);
        parentElm.removeEventListener('mouseup', onCleanup);
      };

      parentElm.addEventListener('mousemove', onMouseMove);
      parentElm.addEventListener('mouseleave', onCleanup);
      parentElm.addEventListener('mouseup', onCleanup);
    };

    targetElm?.addEventListener('mousedown', onMouseDown);

    return () => {
      targetElm?.removeEventListener('mousedown', onMouseDown);
    };
  }, [target, parent, destoryDashed, whenMouseDown]);
}
