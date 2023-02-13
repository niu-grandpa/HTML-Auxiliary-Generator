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
  const dashedElm = useRef<HTMLElement | null>(null);
  const auxLineElm1 = useRef<HTMLElement | null>(null);
  const auxLineElm2 = useRef<HTMLElement | null>(null);

  const createPlaceholder = useCallback((x: number, y: number) => {
    const { offsetWidth, offsetHeight } = targetRef.current!;
    let dashed = dashedElm.current;
    if (dashedElm.current === null) {
      dashedElm.current = document.createElement('div');
      dashed = dashedElm.current;
      dashed.id = 'Move_Elm_Placeholder';
      dashed.style.boxShadow = '0 2px 0 rgb(0 0 0 / 2%)';
      dashed.style.border = '1px dashed #1677ff';
      dashed.style.width = `${offsetWidth}px`;
      dashed.style.height = `${offsetHeight}px`;
      parentRef.current?.appendChild(dashed!);
    }
    dashedElm.current.style.display = '';
    dashed!.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const createAuxLine = useCallback((x: number) => {
    const { offsetWidth } = targetRef.current!;
    if (auxLineElm1.current === null || auxLineElm2.current === null) {
      auxLineElm1.current = document.createElement('div');
      auxLineElm2.current = document.createElement('div');
      auxLineElm1.current.className = 'view-opts-auxline';
      auxLineElm2.current.className = 'view-opts-auxline';
      parentRef.current?.append(auxLineElm1.current, auxLineElm2.current);
    }
    auxLineElm1.current.style.display = '';
    auxLineElm2.current.style.display = '';
    auxLineElm1.current.style.left = `${x}px`;
    auxLineElm2.current.style.left = `${x + offsetWidth}px`;
  }, []);

  const hiddenOtherElm = useCallback(() => {
    dashedElm.current!.style.display = 'none';
    auxLineElm1.current!.style.display = 'none';
    auxLineElm2.current!.style.display = 'none';
  }, []);

  const whenMouseDown = useCallback(
    (ev: MouseEvent) => {
      const { offsetLeft, offsetTop } = targetRef.current!;
      // 鼠标点击物体那一刻相对于物体左侧边框的
      // 距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
      const diffX = ev.clientX - offsetLeft;
      const diffY = ev.clientY - offsetTop;
      createPlaceholder(offsetLeft, offsetTop);
      return [diffX, diffY];
    },
    [createPlaceholder]
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
      const onMouseMove = (ev2: MouseEvent) => {
        ev2.stopPropagation();
        let moveX = ev2.clientX - diffX;
        let moveY = ev2.clientY - diffY;
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
        createAuxLine(moveX);
        callbackRef.current(moveX, moveY);
      };
      const onCleanup = (ev3: MouseEvent) => {
        ev3.stopPropagation();
        hiddenOtherElm();
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
      dashedElm.current = null;
      auxLineElm1.current = null;
      auxLineElm2.current = null;
      targetElm?.removeEventListener('mousedown', onMouseDown);
    };
  }, [target, parent, whenMouseDown, createAuxLine, hiddenOtherElm]);
}
