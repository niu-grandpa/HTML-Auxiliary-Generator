import { isEqual } from 'lodash';
import {
  FC,
  memo,
  MouseEvent,
  ReactNode,
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

  useEffect(() => {
    setDragNodes(renderDragVnode(vnodes));
    setHTMLString(buildHTMLString(vnodes));
  }, [vnodes]);

  const handleNodeClick = useCallback(
    (e: MouseEvent) => {
      const { dataset } = e.target as HTMLElement;
      if (!isEqual(dataset[targetDatasetName], 'true')) return false;
      const key = dataset['dragVnodeUuid'] as string;
      onItemClick(key);
    },
    [onItemClick]
  );

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <section
      ref={wrapperElem}
      className='view-opts'
      onClick={handleNodeClick}
      onContextMenu={handleContextMenu}>
      {dragNodes}
    </section>
  );
});

export default ViewOperations;
