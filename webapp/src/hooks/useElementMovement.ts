import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AuxlineData = {
  /** x轴辅助线的水平局中值 */
  xAlign: number;
  /** 用于x轴左辅助线 */
  xLeft: number;
  /** 用于x轴右辅助线 */
  xRight: number;
  /** y轴辅助线的垂直局中值 */
  yAlign: number;
  /** 用于y轴上辅助线 */
  yTop: number;
  /** 用于y轴下辅助线 */
  yBottom: number;
};

type AuxlineCb = (data: AuxlineData) => void;

const turnPositive = (num: number) => (num < 0 ? 0 : num);

/**
 * useElementMovement
 *
 * 该函数用于实现元素跟随鼠标移动
 */
export function useElementMovement() {
  const refElem = useRef<HTMLElement | null>(null);
  const activeElem = useRef<HTMLElement | null>(null);
  // getBoundingClientRect
  const activeElemBCR = useRef<DOMRect>();
  // 获取辅助线坐标数据的回调函数
  const callbackRef = useRef<AuxlineCb>();

  // 初始坐标数据
  const [coordinate, setCoordinate] = useState({
    // 鼠标指针在目标元素的偏移量
    shiftX: 0,
    shiftY: 0,
    // 目标初始位置
    initailX: 0,
    initailY: 0,
  });

  const setTargetData = useCallback((target: HTMLElement, clientX: number, clientY: number) => {
    activeElem.current = target;
    activeElem.current.dataset.isMoving = 'true';
    activeElemBCR.current = target.getBoundingClientRect();

    setCoordinate(value => {
      // 加5修正鼠标指针位置
      value.shiftX = clientX - activeElemBCR.current!.x + 5;
      value.shiftY = clientY - activeElemBCR.current!.y + 5;
      value.initailX = turnPositive(target.offsetLeft - refElem.current!.offsetLeft);
      value.initailY = turnPositive(target.offsetTop - refElem.current!.offsetTop);
      return value;
    });
  }, []);

  const activeHandler = useCallback((ref: MutableRefObject<HTMLElement>) => {
    refElem.current = ref.current;
  }, []);

  const getAuxlineData = useCallback((callback: AuxlineCb) => {
    callbackRef.current = callback;
  }, []);

  const calcAuxlineData = useCallback(
    (x: number, y: number) => {
      const top = y + coordinate.initailY;
      const left = x + coordinate.initailX;
      const { width, height } = activeElemBCR.current!;
      const data: AuxlineData = {
        xAlign: top + (height >> 1),
        xLeft: left,
        xRight: left + width,
        yAlign: left + (width >> 1),
        yTop: top,
        yBottom: top + height,
      };
      return data;
    },
    [coordinate]
  );

  const calcMoveingData = useCallback(
    (clientX: number, clientY: number): number[] => {
      const { shiftX, shiftY, initailX, initailY } = coordinate;

      const { width: targetWidth, height: targetHeight } = activeElemBCR.current!;
      const { offsetWidth: wrapperWidth, offsetHeight: wrapperHeight } = refElem.current!;

      const maxLeftMargin = wrapperWidth - (targetWidth + initailX);
      const maxRightMargin = wrapperHeight - (targetHeight + initailY);

      // 计算公式
      // x = 鼠标坐标 - 目标初始坐标 - 鼠标指针偏移量 - 父盒子初始偏移量
      // y = 鼠标坐标 - 目标初始坐标 - 鼠标指针偏移量
      let x = clientX - initailX - shiftX - refElem.current!.offsetLeft;
      let y = clientY - initailY - shiftY;

      // 修正目标超出左右边界
      x < -initailX && (x = -initailX);
      x > maxLeftMargin && (x = maxLeftMargin);

      // 修正目标超出上下边界
      y < -initailY && (y = -initailY);
      y > maxRightMargin && (y = maxRightMargin);

      return [x, y];
    },
    [coordinate]
  );

  // refElem鼠标移动
  const onMoveing = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const [x, y] = calcMoveingData(event.clientX, event.clientY);
      callbackRef.current?.(calcAuxlineData(x, y));
      activeElem.current!.style.translate = `${x}px ${y}px`;
    },
    [calcMoveingData, calcAuxlineData]
  );

  const onMoveEnd = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (activeElem.current) {
        activeElem.current.dataset.isMoving = '';
        activeElem.current = null;
      }

      refElem.current!.removeEventListener('mousemove', onMoveing);
      refElem.current!.removeEventListener('mouseleave', onMoveEnd);
      refElem.current!.removeEventListener('mouseup', onMoveEnd);
    },
    [onMoveing]
  );

  // refElem鼠标按下准备移动
  const onReadyToMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const { target, clientX, clientY } = event;

      // 通过事件冒泡获取获取是否为目标对象
      if ((target as HTMLElement).dataset.isMoveingTarget !== 'true') {
        return false;
      }

      setTargetData(target as HTMLElement, clientX, clientY);

      refElem.current!.addEventListener('mousemove', onMoveing);
      refElem.current!.addEventListener('mouseleave', onMoveEnd);
      refElem.current!.addEventListener('mouseup', onMoveEnd);
    },
    [setTargetData, onMoveing, onMoveEnd]
  );

  useEffect(() => {
    if (refElem.current !== null) {
      console.log('active');
      refElem.current.addEventListener('mousedown', onReadyToMove);
      return () => {
        refElem.current!.removeEventListener('mousedown', onReadyToMove);
        refElem.current = null;
      };
    }
  }, [refElem, onReadyToMove, onMoveing]);

  return useMemo(() => ({ activeHandler, getAuxlineData }), [activeHandler, getAuxlineData]);
}
