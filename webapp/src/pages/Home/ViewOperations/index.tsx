import { message } from 'antd';
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
import {
  ContextMenu,
  ContextMenuHandlers,
} from '../../../components/ContextMenu';
import core, { calcActualPos, renderDragVnode } from '../../../core';
import { ProcessTreeDataNode } from '../../../core/type';
import { resolveKeyConflicts } from '../../../core/utils';
import { useDrag } from '../../../hooks';
import { useTreeDataModel } from '../../../model';
import {
  getDomByNodeKey,
  getIsTargetNode,
  getStringPxToNumber,
} from '../../../utils';

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

  const wrapperElem = useRef<HTMLElement>(null);
  const { onDragComplete } = useDrag(wrapperElem.current, targetDatasetName);

  onDragComplete((x, y, key) => {
    updateNodePos(key, x, y);
  });

  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [ctxPos, setCtxPos] = useState<number[]>([0, 0]);
  const [copyNode, setCopyNode] = useState<ProcessTreeDataNode>();
  const [selected, setSelected] = useState<ProcessTreeDataNode>();

  const nodeType = useMemo(() => selected?.type || 0, [selected]);
  const canPaste = useMemo(() => isUndefined(copyNode), [copyNode]);

  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    saveDragVnodes(cloneDeep(vnodes));
    return renderDragVnode(vnodes);
  }, [treeData, saveDragVnodes]);

  useEffect(() => {
    saveSelectedNode({ key: selected?.key ?? '', node: selected });
  }, [selected, saveSelectedNode]);

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(treeData, key);
      return cloneDeep(current) as ProcessTreeDataNode;
    },
    [treeData]
  );

  const setNodePosData = useCallback(
    (node: ProcessTreeDataNode, x: number, y: number) => {
      node.actualPos = calcActualPos(wrapperElem.current!, x, y);
      const style = node.props!.style;
      node.props!.style = {
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
      noticeUpdateNode(current as ProcessTreeDataNode);
    },
    [getTreeNode, noticeUpdateNode, setNodePosData]
  );

  const optsMethods = useMemo(
    () => ({
      create() {},
      copy: (treeNode?: ProcessTreeDataNode) => {
        treeNode ? setCopyNode(cloneDeep(treeNode)) : setCopyNode(undefined);
      },
      cut: (treeNode: ProcessTreeDataNode) => {
        if (isEqual(treeData.length, 1)) {
          message.info('需要节点数量大于1');
          return;
        }
        optsMethods.copy(treeNode);
        optsMethods.del(treeNode, false);
      },
      paste: (
        targetNode: ProcessTreeDataNode,
        mouseX: number,
        mouseY: number
      ) => {
        const c = cloneDeep(copyNode)!;
        resolveKeyConflicts(c);
        if (isUndefined(targetNode)) {
          setNodePosData(c, mouseX, mouseY);
          noticePushNode(c);
        } else {
          const parentDom = getDomByNodeKey(targetNode.key as string);
          const [x, y] = getStringPxToNumber(parentDom.style.translate);
          setNodePosData(c, mouseX - x, mouseY - y);
          targetNode.children?.push(c);
          noticeUpdateNode(targetNode);
        }
      },
      del: (treeNode: ProcessTreeDataNode, restCopy = true) => {
        noticeDeleteNode(treeNode);
        setSelected(undefined);
        restCopy && optsMethods.copy(undefined);
      },
    }),
    [
      treeData,
      copyNode,
      noticeUpdateNode,
      noticePushNode,
      noticeDeleteNode,
      setNodePosData,
    ]
  );

  const handleCreate = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      setOpenCtxMenu(true);
      setCtxPos([e.clientX, e.clientY]);
      const node = getIsTargetNode(e.target as HTMLElement);
      if (!node) {
        setSelected(undefined);
        return false;
      }
      const key = node.dataset[targetKeyName]!;
      const nodeObj = getTreeNode(key);
      setSelected(nodeObj);
    },
    [getTreeNode]
  );

  const ctxMenuHandlers = useMemo<ContextMenuHandlers>(
    () => ({
      onCreate: () => {
        // todo
      },
      onCopy: () => optsMethods.copy(selected),
      onCut: () => optsMethods.cut(selected!),
      onPaste: () => optsMethods.paste(selected!, ctxPos[0], ctxPos[1]),
      onDelete: () => optsMethods.del(selected!, true),
      onEdit: () => {},
      onContent: () => {},
    }),
    [optsMethods, selected, ctxPos]
  );

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const node = getIsTargetNode(e.target as HTMLElement);
      if (!node) {
        setSelected(undefined);
        setOpenCtxMenu(false);
        return false;
      }
      setSelected(getTreeNode(node.dataset[targetKeyName]!));
    },
    [getTreeNode]
  );

  return (
    <ContextMenu
      target={selected}
      open={openCtxMenu}
      handler={ctxMenuHandlers}
      {...{ nodeType, canPaste }}
      onClose={() => setOpenCtxMenu(false)}>
      <section
        ref={wrapperElem}
        className='view-opts'
        onClick={handleNodeClick}
        onDragEnd={handleNodeClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleCreate}>
        {!dragNodes.length ? null : dragNodes}
      </section>
    </ContextMenu>
  );
});

export default ViewOperations;
