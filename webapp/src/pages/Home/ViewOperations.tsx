import { isEqual, isUndefined } from 'lodash';
import {
  FC,
  MouseEvent,
  ReactNode,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import MyContext from '../../context';
import core from '../../core';
import { type VNode } from '../../core/utils';
import { useDrag } from '../../hooks';

type Props = {
  vnodes: VNode[];
  onItemClick: (key: string) => void;
};

const { buildHTMLString, renderDragVnode } = core;

const targetDatasetName = 'isDragTarget';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(({ vnodes, onItemClick }) => {
  const {} = useContext(MyContext);

  const wrapperElem = useRef<HTMLElement>(null);
  useDrag(wrapperElem.current, targetDatasetName);

  const [htmlString, setHTMLString] = useState<string>('');
  const [dragNodes, setDragNodes] = useState<ReactNode[]>([]);
  const [eventTarget, setEventTarget] = useState<MouseEvent>();

  useEffect(() => {
    setDragNodes(renderDragVnode(vnodes));
    setHTMLString(buildHTMLString(vnodes));
  }, [vnodes]);

  const invokeItemClick = useCallback(
    (e: MouseEvent) => {
      const { dataset } = e.target as HTMLElement;
      if (!isEqual(dataset[targetDatasetName], 'true')) {
        setEventTarget(undefined);
        return false;
      }
      const key = dataset['dragVnodeUuid'] as string;
      onItemClick(key);
      setEventTarget(e);
    },
    [onItemClick]
  );

  const handleNodeClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      invokeItemClick(e);
    },
    [invokeItemClick]
  );

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSizeAdjust = useCallback((w: number, h: number) => {
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
      <SizeAdjust {...{ eventTarget }} onChange={handleSizeAdjust} />
    </>
  );
});

const SizeAdjust: FC<{
  eventTarget?: MouseEvent;
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
    console.log(target.getBoundingClientRect(), eventTarget);
  }, [eventTarget]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // console.log(e.target);
  }, []);

  return (
    <div
      className='size-adjust'
      onMouseDown={handleMouseDown}
      style={eventTarget ? { ...targetSize, display: 'flex' } : undefined}>
      <ul className='size-adjust-line left'>
        <li className='size-adjust-dot' />
        <li className='size-adjust-dot' />
        <li className='size-adjust-dot' />
      </ul>
      <ul className='size-adjust-line center'>
        <li className='size-adjust-dot' />
        <li className='size-adjust-dot' />
      </ul>
      <ul className='size-adjust-line right'>
        <li className='size-adjust-dot' />
        <li className='size-adjust-dot' />
        <li className='size-adjust-dot' />
      </ul>
    </div>
  );
});

export default ViewOperations;
