import { Dropdown, TreeDataNode, message } from 'antd';
import { clone, cloneDeep, isEqual, isUndefined } from 'lodash';
import {
  FC,
  MouseEvent as ReactMouseEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CTX_MENU_OPTS } from '../../components/ContextMenu';
import core, { calcActualPos, renderDragVnode } from '../../core';
import { resolveKeyConflicts } from '../../core/utils';
import { useDrag } from '../../hooks';
import { useTreeDataModel } from '../../model';
import { getIsTargetNode } from '../../utils';

type Props = {};

const { antTreeNodeToVNode, findNode } = core;

const targetDatasetName = 'isDragTarget';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(props => {
  const {
    treeData,
    noticePushNode,
    noticeDeleteNode,
    noticeUpdateNode,
    saveSelectedKey,
    saveDragVnodes,
  } = useTreeDataModel(state => ({
    treeData: state.treeData,
    saveDragVnodes: state.saveDragVnodes,
    noticePushNode: state.push,
    noticeDeleteNode: state.delete,
    noticeUpdateNode: state.update,
    saveSelectedKey: state.saveSelectedKey,
  }));

  const wrapperElem = useRef<HTMLElement>(null);
  const currentKey = useRef('');

  const [disCtxMenu, setDisCtxMenu] = useState(false);
  const [copyNode, setCopyNode] = useState<TreeDataNode | undefined>(undefined);

  const disPaste = useMemo(() => isUndefined(copyNode), [copyNode]);

  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    saveDragVnodes(cloneDeep(vnodes));
    return renderDragVnode(vnodes);
  }, [treeData, saveDragVnodes]);

  const { onDragComplete } = useDrag(wrapperElem.current, targetDatasetName);
  onDragComplete((x, y, key) => {
    updateNodePos(key, x, y);
  });

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(treeData, key);
      return current;
    },
    [treeData]
  );

  const setNodePosData = useCallback(
    (node: TreeDataNode, x: number, y: number) => {
      // @ts-ignore
      node.actualPos = calcActualPos(wrapperElem.current!, x, y);
      // @ts-ignore
      const style = node.props.style;
      // @ts-ignore
      node.props.style = {
        ...style,
        translate: `${x}px ${y}px`,
      };
    },
    []
  );

  const updateNodePos = useCallback(
    (key: string, x: number, y: number) => {
      const current = getTreeNode(key);
      if (isUndefined(current)) return;
      setNodePosData(current, x, y);
      noticeUpdateNode(clone(current));
    },
    [getTreeNode, noticeUpdateNode, setNodePosData]
  );

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const res = getIsTargetNode(e.target as HTMLElement);
      if (!res) {
        saveSelectedKey('');
        return false;
      }
      const key = res.dataset['dragVnodeUuid'] as string;
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

  const optsMethods = useMemo(
    () => ({
      del: (treeNode?: TreeDataNode) => {
        noticeDeleteNode(treeNode);
        // currentKey.current = '';
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
      paste: (x: number, y: number) => {
        const { left, top } = wrapperElem.current!.getBoundingClientRect();
        setNodePosData(copyNode!, x - left, y - top);
        noticePushNode(cloneDeep(resolveKeyConflicts(copyNode!)));
      },
    }),
    [treeData, copyNode, noticePushNode, noticeDeleteNode, setNodePosData]
  );

  const optionsEvent = useCallback(
    (type: 'copy' | 'cut' | 'del' | 'paste', ev?: any) => {
      if (type === 'paste') {
        const { domEvent } = ev;
        optsMethods.paste(domEvent.clientX, domEvent.clientY);
        // setCopyNode(undefined);
      } else {
        const treeNode = getTreeNode(currentKey.current);
        optsMethods[type](treeNode);
      }
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
        onClick: (e: unknown) => optionsEvent('paste', e),
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
      </section>
    </Dropdown>
  );
});

export default ViewOperations;
