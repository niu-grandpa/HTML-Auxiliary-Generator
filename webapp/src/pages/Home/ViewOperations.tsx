import { isEqual } from 'lodash';
import {
  FC,
  memo,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import core from '../../core';
import { type VNode } from '../../core/utils';
import { useElementMovement, type AuxlineData } from '../../hooks';

type Props = {
  vnodes: VNode[];
  onItemClick: (key: string) => void;
};

const { buildHTMLString, renderDragVnode } = core;

const isDragTarget = 'isDragTarget';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(({ vnodes, onItemClick }) => {
  const { activeHandler, getAuxlineData, getIsMoving, getMouseCoordinate } =
    useElementMovement('isDragTarget');

  const wrapperElemRef = useRef<HTMLElement>(null);

  const [isMouseMove, setIsMouseMove] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [htmlString, setHTMLString] = useState<string>('');
  const [auxlineData, setAuxlineData] = useState<AuxlineData>();
  const [coordinate, setCoordinate] = useState<number[]>([0, 0]);
  const [dragNodes, setDragNodes] = useState<ReactNode[]>([]);

  getAuxlineData(setAuxlineData);
  getIsMoving(setIsMouseMove);
  getMouseCoordinate((x, y) => setCoordinate([x, y]));

  useEffect(() => {
    activeHandler(wrapperElemRef);
  }, [wrapperElemRef, activeHandler]);

  useEffect(() => {
    setDragNodes(renderDragVnode(vnodes));
    setHTMLString(buildHTMLString(vnodes));
  }, [vnodes]);

  const handleRightClick = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragElemClick = useCallback(
    (e: MouseEvent) => {
      const { dataset } = e.target as HTMLElement;
      if (!isEqual(dataset[isDragTarget], 'true')) return false;
      let key = dataset['dragVnodeUuid'] as string;
      onItemClick(key);
    },
    [onItemClick]
  );

  const renderAuxline = useCallback(() => {
    const [x, y] = coordinate;

    const { xCenter, xAlign, x1, x2, yCenter, yAlign, y1, y2 } = auxlineData!;
    const showLfLine = x <= xCenter ? '' : 'none';
    const showRtLine = x >= xCenter ? '' : 'none';
    const showTpLine = y <= yCenter ? '' : 'none';
    const showBtmLine = y >= yCenter ? '' : 'none';

    return (
      <div style={{ display: isMouseMove ? '' : 'none' }}>
        {/* 上线 */}
        <div
          className='view-opts-auxline-y'
          style={{ display: showTpLine, height: y1, left: yAlign }}
        />
        {/* 下线 */}
        <div
          className='view-opts-auxline-y'
          style={{ display: showBtmLine, top: y2, left: yAlign }}
        />
        {/* 左线 */}
        <div
          className='view-opts-auxline-x'
          style={{ display: showLfLine, width: x1, top: xAlign }}
        />
        {/* 右线 */}
        <div
          className='view-opts-auxline-x'
          style={{ display: showRtLine, left: x2, top: xAlign }}
        />
      </div>
    );
  }, [isMouseMove, coordinate, auxlineData]);

  return (
    <section
      ref={wrapperElemRef}
      className='view-opts'
      onClick={handleDragElemClick}
      onContextMenu={handleRightClick}>
      {dragNodes}
      {/* {auxlineData !== undefined && renderAuxline()} */}
    </section>
  );
});

export default ViewOperations;
