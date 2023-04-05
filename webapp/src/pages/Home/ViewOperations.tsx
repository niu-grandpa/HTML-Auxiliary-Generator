import { isEqual, isUndefined } from 'lodash';
import {
  FC,
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { StyleFormValues } from '../../components/DrawerStyleSettings';
import core from '../../core';
import { useDrag } from '../../hooks';
import { useTreeDataModel } from '../../model';

type Props = {};

const { renderDragVnode, antTreeNodeToVNode, findNode } = core;

const targetDatasetName = 'isDragTarget';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(props => {
  const { treeData, onNeedUpdateNode, saveSelectedKey } = useTreeDataModel(
    state => ({
      treeData: state.treeData,
      onNeedUpdateNode: state.update,
      saveSelectedKey: state.saveSelectedKey,
    })
  );

  const wrapperElem = useRef<HTMLElement>(null);
  const [dragNodes, setDragNodes] = useState<ReactNode[]>([]);
  const [eventTarget, setEventTarget] = useState<ReactMouseEvent>();

  useEffect(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    setDragNodes(renderDragVnode(vnodes));
  }, [treeData]);

  const { onDragComplete } = useDrag(wrapperElem.current, targetDatasetName);
  onDragComplete((x, y, key) => {
    onModifyNodePos(key, { top: `${y}%`, left: `${x}%` });
  });

  const onModifyNodePos = useCallback(
    (key: string, values: StyleFormValues) => {
      const current = findNode(treeData, key);
      if (isUndefined(current)) return;
      // @ts-ignore
      current.props.style = { ...current.props.style, ...values };
      onNeedUpdateNode(current);
    },
    [treeData, onNeedUpdateNode]
  );

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const { dataset } = e.target as HTMLElement;
      if (!isEqual(dataset[targetDatasetName], 'true')) {
        saveSelectedKey('');
        setEventTarget(undefined);
        return false;
      }
      const key = dataset['dragVnodeUuid'] as string;
      setEventTarget(e);
      saveSelectedKey(key);
    },
    [saveSelectedKey]
  );

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleNodeResize = useCallback((w: number, h: number) => {
    console.log(w, h);
  }, []);

  return (
    <>
      <section
        ref={wrapperElem}
        className='view-opts'
        onClick={handleNodeClick}
        onContextMenu={handleContextMenu}>
        {dragNodes}
      </section>
      <Resize {...{ eventTarget }} onChange={handleNodeResize} />
    </>
  );
});

const Resize: FC<{
  eventTarget?: ReactMouseEvent;
  onChange: (w: number, h: number) => void;
}> = memo(({ onChange, eventTarget }) => {
  const [targetSize, setTargetSize] = useState({
    width: 0,
    height: 0,
    top: '',
    left: '',
  });

  useEffect(() => {
    if (isUndefined(eventTarget)) return;
    const target = eventTarget.target! as HTMLElement;
    setTargetSize(() => ({
      width: target.offsetWidth,
      height: target.offsetHeight,
      top: target.style.top,
      left: target.style.left,
    }));
  }, [eventTarget]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    // TODO
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      document.removeEventListener('mousemove', handleMouseMove);
      // TODO
    },
    [handleMouseMove]
  );

  const handleResize = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (!target.classList.contains('size-adjust-dot')) return false;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const stopAllEvent = useCallback((e: ReactDragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      className='size-adjust'
      onMouseDown={handleResize}
      onDragStart={stopAllEvent}
      style={eventTarget ? { ...targetSize, display: 'flex' } : undefined}>
      <ul className='size-adjust-line left'>
        <li className='size-adjust-dot' data-placement='leftTop' />
        <li className='size-adjust-dot' data-placement='left' />
        <li className='size-adjust-dot' data-placement='leftBottom' />
      </ul>
      <ul className='size-adjust-line center'>
        <li className='size-adjust-dot' data-placement='centerTop' />
        <li className='size-adjust-dot' data-placement='centerBottom' />
      </ul>
      <ul className='size-adjust-line right'>
        <li className='size-adjust-dot' data-placement='rightTop' />
        <li className='size-adjust-dot' data-placement='right' />
        <li className='size-adjust-dot' data-placement='rightBottom' />
      </ul>
    </div>
  );
});

export default ViewOperations;
