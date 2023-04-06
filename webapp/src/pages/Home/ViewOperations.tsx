import { Dropdown, TreeDataNode, message } from 'antd';
import { cloneDeep, isEqual, isUndefined } from 'lodash';
import {
  FC,
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CTX_MENU_OPTS } from '../../components/ContextMenu';
import { StyleFormValues } from '../../components/DrawerStyleSettings';
import core from '../../core';
import { useDrag } from '../../hooks';
import { useTreeDataModel } from '../../model';
import { getIsTargetNode } from '../../utils';

type Props = {};

const { renderDragVnode, antTreeNodeToVNode, findNode } = core;

const targetDatasetName = 'isDragTarget';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(props => {
  const { treeData, noticeDeleteNode, noticeUpdateNode, saveSelectedKey } =
    useTreeDataModel(state => ({
      treeData: state.treeData,
      noticeDeleteNode: state.delete,
      noticeUpdateNode: state.update,
      saveSelectedKey: state.saveSelectedKey,
    }));

  const wrapperElem = useRef<HTMLElement>(null);
  const currentKey = useRef('');

  const [disCtxMenu, setDisCtxMenu] = useState(false);
  const [eventTarget, setEventTarget] = useState<ReactMouseEvent>();
  const [copyNode, setCopyNode] = useState<TreeDataNode | undefined>(undefined);

  const disPaste = useMemo(() => isUndefined(copyNode), [copyNode]);

  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    return renderDragVnode(vnodes);
  }, [treeData]);

  const { onDragComplete } = useDrag(wrapperElem.current, targetDatasetName);
  onDragComplete((x, y, key) => {
    updateNodePos(key, { top: `${y}%`, left: `${x}%` });
  });

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(treeData, key);
      return current;
    },
    [treeData]
  );

  const updateNodePos = useCallback(
    (key: string, values: StyleFormValues) => {
      const current = getTreeNode(key);
      if (isUndefined(current)) return;
      // @ts-ignore
      current.props.style = { ...current.props.style, ...values };
      noticeUpdateNode(current);
    },
    [getTreeNode, noticeUpdateNode]
  );

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const res = getIsTargetNode(e.target as HTMLElement);
      if (!res) {
        saveSelectedKey('');
        setEventTarget(undefined);
        return false;
      }
      const key = res.dataset['dragVnodeUuid'] as string;
      setEventTarget(e);
      saveSelectedKey(key);
    },
    [saveSelectedKey]
  );

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      const target = getIsTargetNode(e.target as HTMLElement);
      if (!target) {
        !disCtxMenu && setDisCtxMenu(true);
        return false;
      }
      setDisCtxMenu(false);
      currentKey.current = target.dataset['dragVnodeUuid']!;
    },
    [disCtxMenu]
  );

  const handleNodeResize = useCallback((w: number, h: number) => {
    console.log(w, h);
  }, []);

  const optsMethods = useMemo(
    () => ({
      del: (treeNode?: TreeDataNode) => {
        noticeDeleteNode(treeNode);
        currentKey.current = '';
      },
      copy: (treeNode?: TreeDataNode) => {
        setCopyNode(cloneDeep(treeNode));
      },
      cut: (treeNode?: TreeDataNode) => {
        if (isEqual(treeData.length, 1)) {
          message.info('需要节点数量大于1');
          return;
        }
        optsMethods.copy(treeNode);
        optsMethods.del(treeNode);
      },
      paste: () => {
        console.log(copyNode);
      },
    }),
    [treeData, copyNode, noticeDeleteNode]
  );

  const optionsEvent = useCallback(
    (type: 'copy' | 'cut' | 'del' | 'paste') => {
      const treeNode = getTreeNode(currentKey.current);
      optsMethods[type](treeNode);
    },
    [getTreeNode, optsMethods]
  );

  const items = useMemo(
    () => [
      {
        label: '复制',
        key: CTX_MENU_OPTS.COPY,
        disabled: disCtxMenu,
        onClick: () => optionsEvent('copy'),
      },
      {
        label: '剪切',
        key: CTX_MENU_OPTS.CUT,
        disabled: disCtxMenu,
        onClick: () => optionsEvent('cut'),
      },
      {
        label: '粘贴',
        key: CTX_MENU_OPTS.PASTE,
        disabled: disPaste,
        onClick: () => optionsEvent('paste'),
      },
      {
        label: '删除',
        key: CTX_MENU_OPTS.REMOVE,
        danger: true,
        disabled: disCtxMenu,
        onClick: () => optionsEvent('del'),
      },
    ],
    [disCtxMenu, disPaste, optionsEvent]
  );

  return (
    <>
      <Dropdown
        trigger={['contextMenu']}
        overlayStyle={{ width: 100 }}
        menu={{ items }}>
        <section
          ref={wrapperElem}
          className='view-opts'
          onClick={handleNodeClick}
          onContextMenu={handleContextMenu}>
          {dragNodes}
          <Resize {...{ eventTarget }} onChange={handleNodeResize} />
        </section>
      </Dropdown>
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
