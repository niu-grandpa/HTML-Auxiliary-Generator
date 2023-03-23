import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type AuxlineData = {
  /** 画布x轴中心点 */
  xCenter: number;
  /** 画布y轴中心点 */
  yCenter: number;
  /** x水平轴的中点距 */
  xAlign: number;
  /** 用于x轴左辅助线 */
  x1: number;
  /** 用于x轴右辅助线 */
  x2: number;
  /** y垂直轴的中点距 */
  yAlign: number;
  /** 用于y轴上辅助线 */
  y1: number;
  /** 用于y轴下辅助线 */
  y2: number;
};

type AuxlineCb = (data: AuxlineData) => void;
type getIsMovingCb = (moving: boolean) => void;
type MouseCoordinateCb = (x: number, y: number) => void;

type UseElementMovement = {
  getAuxlineData: (callback: AuxlineCb) => void;
  getIsMoving: (callback: getIsMovingCb) => void;
  getMouseCoordinate: (callback: MouseCoordinateCb) => void;
  activeHandler: (ref: MutableRefObject<HTMLElement | null>) => void;
};

/**
 * useElementMovement
 *
 * 该函数用于实现元素跟随鼠标移动
 * @param {string} tagetDatasetName 目标对象的dataset字段名
 */
export function useElementMovement(
  tagetDatasetName: string
): UseElementMovement {
  const refElem = useRef<HTMLElement | null>(null);
  const activeElem = useRef<HTMLElement | null>(null);
  // getBoundingClientRect
  const activeElemBCR = useRef<DOMRect>();

  // 获取辅助线坐标数据的回调函数
  const getAuxlineCbRef = useRef<AuxlineCb>();
  // 当前是否准备要移动。鼠标按下
  const getIsMovingCbRef = useRef<getIsMovingCb>();
  // 获取鼠标坐标数据的回调函数
  const getMouseCoordinateCbRef = useRef<MouseCoordinateCb>();

  // 目标元素初始坐标数据
  const [coordinate, setCoordinate] = useState({
    shiftX: 0,
    shiftY: 0,
    initailX: 0,
    initailY: 0,
  });

  const calcMoveingData = useCallback(
    (clientX: number, clientY: number): number[] => {
      const { width, height } = activeElemBCR.current!;
      const { initailX, initailY, shiftX, shiftY } = coordinate;

      const { offsetWidth, offsetHeight } = refElem.current!;
      const { x: parentX, y: parentY } =
        refElem.current!.getBoundingClientRect();

      const minTop = parentY - initailY; // [0, -n)
      const minLeft = parentX - initailX; // [0, -n)
      const maxRight = offsetWidth - (initailX + width) + parentX;
      const maxBottom = offsetHeight - (initailY + height) + parentY;

      let x = ~~(clientX - initailX - shiftX);
      let y = ~~(clientY - initailY - shiftY);

      // 防止上左边界溢出
      y < minTop && (y = minTop);
      x < minLeft && (x = minLeft);
      // 防止下右边界溢出
      x > maxRight && (x = maxRight);
      y > maxBottom && (y = maxBottom);

      return [x, y];
    },
    [coordinate]
  );

  const calcAuxlineData = useCallback((x: number, y: number): AuxlineData => {
    const { width, height } = activeElemBCR.current!;

    const { offsetLeft: targetLeft, offsetTop: targetTop } =
      activeElem.current!;

    const { offsetWidth: parentWidth, offsetHeight: parentHeight } =
      refElem.current!;
    // x1、x2、y1、y2 的轴线距离是相对于目标元素位置来计算的
    // 初始水平和垂直距
    const horizontal = x + targetLeft;
    const vertical = y + targetTop;
    // x轴左距
    const x1 = horizontal;
    // x轴右距
    const x2 = x1 + width;
    // 在目标元素x水平轴的中点距
    const xAlign = vertical + (height >> 1);
    // y轴上距
    const y1 = vertical;
    // y轴下距
    const y2 = y1 + height;
    // 在目标元素y垂直轴的中点距
    const yAlign = horizontal + (width >> 1);
    // 画布x y中心点
    const xCenter = ((parentWidth - width) >> 1) - targetLeft;
    const yCenter = ((parentHeight - height) >> 1) - targetTop;

    return {
      xCenter,
      yCenter,
      xAlign,
      x1,
      x2,
      yAlign,
      y1,
      y2,
    };
  }, []);

  const setTargetData = useCallback(
    (target: HTMLElement, clientX: number, clientY: number) => {
      activeElem.current = target;
      activeElem.current.dataset.isMoving = 'true';
      activeElemBCR.current = target.getBoundingClientRect();

      const { x, y } = activeElemBCR.current;
      const { offsetLeft, offsetTop } = activeElem.current!;
      const { x: parentX, y: parentY } =
        refElem.current!.getBoundingClientRect();

      setCoordinate(value => {
        // 鼠标指针在目标元素的偏移量
        value.shiftX = clientX - x;
        value.shiftY = clientY - y;
        // 目标初始位置
        value.initailX = parentX + offsetLeft;
        value.initailY = parentY + offsetTop;
        return value;
      });
    },
    []
  );

  const onMoveing = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // 计算元素移动坐标
      const [x, y] = calcMoveingData(event.clientX, event.clientY);
      getIsMovingCbRef.current?.(true);
      getMouseCoordinateCbRef.current?.(x, y);
      // 计算辅助线坐标
      getAuxlineCbRef.current?.(calcAuxlineData(x, y));

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
      getIsMovingCbRef.current?.(false);
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
      if ((target as HTMLElement).dataset[tagetDatasetName] !== 'true') {
        return false;
      }

      setTargetData(target as HTMLElement, clientX, clientY);
      // 包裹层元素绑定事件
      refElem.current!.addEventListener('mousemove', onMoveing);
      refElem.current!.addEventListener('mouseleave', onMoveEnd);
      refElem.current!.addEventListener('mouseup', onMoveEnd);
    },
    [tagetDatasetName, setTargetData, onMoveing, onMoveEnd]
  );

  const activeHandler = useCallback(
    (ref: MutableRefObject<HTMLElement | null>) => {
      if (!ref.current) return;
      refElem.current = ref.current;
    },
    []
  );

  const getAuxlineData = useCallback((callback: AuxlineCb) => {
    getAuxlineCbRef.current = callback;
  }, []);

  const getIsMoving = useCallback((cb: getIsMovingCb) => {
    getIsMovingCbRef.current = cb;
  }, []);
  const getMouseCoordinate = useCallback((cb: MouseCoordinateCb) => {
    getMouseCoordinateCbRef.current = cb;
  }, []);

  useEffect(() => {
    if (refElem.current !== null) {
      console.log('active ');
      refElem.current.addEventListener('mousedown', onReadyToMove);
      return () => {
        refElem.current!.removeEventListener('mousedown', onReadyToMove);
        refElem.current = null;
      };
    }
  }, [refElem, onReadyToMove, onMoveing]);

  return useMemo(
    () => ({
      activeHandler,
      getIsMoving,
      getMouseCoordinate,
      getAuxlineData,
    }),
    [activeHandler, getIsMoving, getMouseCoordinate, getAuxlineData]
  );
}
