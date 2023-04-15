import { Dropdown, TreeDataNode, message } from 'antd';
import { cloneDeep, isEqual, isUndefined } from 'lodash';
import {
  FC,
  MouseEvent as ReactMouseEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CTX_MENU_OPTS } from '../../../components/ContextMenu';
import core, { calcActualPos, renderDragVnode } from '../../../core';
import { resolveKeyConflicts } from '../../../core/utils';
import { useDrag } from '../../../hooks';
import { useTreeDataModel } from '../../../model';
import { getIsTargetNode } from '../../../utils';
import ResizeElem, { ResizeElemData } from './ResizeElem';

type Props = {};

const { antTreeNodeToVNode, findNode } = core;

const targetDatasetName = 'isDragTarget';
const targetKeyName = 'dragVnodeUuid';

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(props => {
  const {
    treeData,
    noticePushNode,
    noticeDeleteNode,
    noticeUpdateNode,
    saveSelectedNode,
    saveDragVnodes,
  } = useTreeDataModel(state => ({
    treeData: state.treeData,
    saveDragVnodes: state.saveDragVnodes,
    noticePushNode: state.push,
    noticeDeleteNode: state.delete,
    noticeUpdateNode: state.update,
    saveSelectedNode: state.saveSelectedNode,
  }));

  const currentKey = useRef('');
  const wrapperElem = useRef<HTMLElement>(null);
  const { onDragComplete } = useDrag(wrapperElem.current, targetDatasetName);

  const [disCtxMenu, setDisCtxMenu] = useState(false);
  const [showResizeElem, setShowResizeElem] = useState(false);
  const [copyNode, setCopyNode] = useState<TreeDataNode | undefined>(undefined);
  const [resizeElemData, setResizeElemData] = useState<ResizeElemData>({
    coordinate: '',
    refWidth: 0,
    refHeight: 0,
  });

  const disPaste = useMemo(() => isUndefined(copyNode), [copyNode]);
  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    saveDragVnodes(cloneDeep(vnodes));
    return renderDragVnode(vnodes);
  }, [treeData, saveDragVnodes]);

  onDragComplete((x, y, key) => {
    updateNodePos(key, x, y);
  });

  useEffect(() => {
    if (!dragNodes.length) {
      setShowResizeElem(false);
      setResizeElemData({
        coordinate: '',
        refWidth: 0,
        refHeight: 0,
      });
    }
  }, [dragNodes]);

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(treeData, key);
      return cloneDeep(current);
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
      noticeUpdateNode(current);
    },
    [getTreeNode, noticeUpdateNode, setNodePosData]
  );

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const res = getIsTargetNode(e.target as HTMLElement);
      if (!res) {
        setShowResizeElem(false);
        saveSelectedNode({ key: '', node: null });
        return false;
      }
      const key = res.dataset[targetKeyName] as string;
      saveSelectedNode({ key, node: getTreeNode(key) });
      setResizeElemData({
        coordinate: res.style.translate,
        refWidth: res.offsetWidth,
        refHeight: res.offsetHeight,
      });
      setShowResizeElem(true);
    },
    [saveSelectedNode, getTreeNode]
  );

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      const target = getIsTargetNode(e.target as HTMLElement);
      if (!target) {
        !disCtxMenu && setDisCtxMenu(true);
        return false;
      }
      setDisCtxMenu(false);
      currentKey.current = target.dataset[targetKeyName]!;
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
        const c = cloneDeep(copyNode)!;
        setNodePosData(c, x - left - 50, y - top - 90);
        resolveKeyConflicts(c);
        noticePushNode(c);
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

  const handleResizeElem = useCallback(() => {}, []);

  return (
    <>
      {!dragNodes.length ? null : (
        <Dropdown
          trigger={['contextMenu']}
          overlayStyle={{ width: 100 }}
          menu={{ items }}>
          <section
            ref={wrapperElem}
            className='view-opts'
            onClick={handleNodeClick}
            onDragEnd={handleNodeClick}
            onContextMenu={handleContextMenu}>
            {dragNodes}
            <ResizeElem
              open={showResizeElem}
              data={resizeElemData}
              onResize={handleResizeElem}
            />
          </section>
        </Dropdown>
      )}
    </>
  );
});

export default ViewOperations;
