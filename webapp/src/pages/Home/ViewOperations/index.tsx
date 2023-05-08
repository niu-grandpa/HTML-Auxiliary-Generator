import { message } from 'antd';
import { cloneDeep, isEqual, isUndefined } from 'lodash';
import {
  MouseEvent as ReactMouseEvent,
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
import core from '../../../core';
import { ProcessTreeDataNode } from '../../../core/type';
import { resolveKeyConflicts } from '../../../core/utils';
import { useDrag } from '../../../hooks';
import { useCreateNodeModel, useTreeDataModel } from '../../../model';
import {
  getDomByNodeKey,
  getHeaderHeight,
  getIsTargetNode,
  getStringPxToNumber,
} from '../../../utils';

const {
  findNode,
  deleteNode,
  updateAntTree,
  renderDragVnode,
  antTreeNodeToVNode,
  calcRealCoordOfNode,
} = core;

const targetDatasetName = 'isDragTarget';
const targetKeyName = 'dragVnodeUuid';

/**视图操作区域 */
const ViewOperations = () => {
  const { nodeData, openCreateModal, setCoordinate, updateNodeData } =
    useCreateNodeModel(state => ({
      nodeData: state.nodeData,
      openCreateModal: state.openModal,
      setCoordinate: state.setCoordinate,
      updateNodeData: state.updateNodeData,
    }));

  const { saveSelectedNode, saveDragVnodes } = useTreeDataModel(state => ({
    saveDragVnodes: state.saveDragVnodes,
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
  const canPaste = useMemo(() => !isUndefined(copyNode), [copyNode]);

  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(nodeData as ProcessTreeDataNode[]);
    saveDragVnodes(cloneDeep(vnodes));
    return renderDragVnode(vnodes);
  }, [nodeData, saveDragVnodes]);

  useEffect(() => {
    saveSelectedNode({ key: selected?.key ?? '', node: selected });
  }, [selected, saveSelectedNode]);

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(nodeData as ProcessTreeDataNode[], key);
      return cloneDeep(current) as ProcessTreeDataNode;
    },
    [nodeData]
  );

  const setNodePosData = useCallback(
    (node: ProcessTreeDataNode, x: number, y: number) => {
      node.actualPos = calcRealCoordOfNode(wrapperElem.current!, x, y);
      const style = node.props!.style;
      node.props!.style = {
        ...style,
        translate: `${x}px ${y}px`,
      };
      updateNodeData(
        updateAntTree(nodeData as ProcessTreeDataNode[], node).slice()
      );
    },
    [nodeData, updateNodeData]
  );

  const updateNodePos = useCallback(
    (key: string, x: number, y: number) => {
      const current = getTreeNode(key);
      if (isUndefined(current)) return;
      setNodePosData(current, x, y);
    },
    [getTreeNode, setNodePosData]
  );

  const optsMethods = useMemo(
    () => ({
      create: (node?: ProcessTreeDataNode, pos?: number[]) => {
        if (!isUndefined(node)) {
          // 计算嵌套的子节点相对父节点的位置
          const parentElm = getDomByNodeKey(node.key);
          const { x, y } = parentElm.getBoundingClientRect();
          if (!isUndefined(pos) && pos.length) {
            pos[0] = pos[0] - x;
            pos[1] = pos[1] - y + getHeaderHeight();
          }
        }
        setCoordinate(pos!);
        openCreateModal(node, false, false);
      },
      addText: (node?: ProcessTreeDataNode) => {
        openCreateModal(node, false, true);
      },
      copy: (node?: ProcessTreeDataNode) => {
        node ? setCopyNode(cloneDeep(node)) : setCopyNode(undefined);
      },
      cut: (node: ProcessTreeDataNode) => {
        if (isEqual(nodeData.length, 1)) {
          message.info('需要节点数量大于1');
          return;
        }
        optsMethods.copy(node);
        optsMethods.del(node, false);
      },
      paste: (targetNode: ProcessTreeDataNode, pos: number[]) => {
        const [mouseX, mouseY] = pos;
        const c = cloneDeep(copyNode)!;
        resolveKeyConflicts(c);
        if (isUndefined(targetNode)) {
          setNodePosData(c, mouseX, mouseY);
          nodeData.push(c);
          updateNodeData(nodeData.slice());
        } else {
          const parentDom = getDomByNodeKey(targetNode.key as string);
          const [x, y] = getStringPxToNumber(parentDom.style.translate);
          setNodePosData(c, mouseX - x, mouseY - y);
          targetNode.children?.push(c);
          updateNodeData(
            updateAntTree(nodeData as ProcessTreeDataNode[], targetNode).slice()
          );
        }
      },
      edit: (node: ProcessTreeDataNode) => openCreateModal(node, true),
      del: (node: ProcessTreeDataNode, restCopy = true) => {
        updateNodeData(
          deleteNode(nodeData as ProcessTreeDataNode[], node).slice()
        );
        setSelected(undefined);
        restCopy && optsMethods.copy(undefined);
      },
    }),
    [
      nodeData,
      copyNode,
      setCoordinate,
      openCreateModal,
      updateNodeData,
      setNodePosData,
    ]
  );

  const handleSetSelected = useCallback(
    (e: ReactMouseEvent) => {
      const node = getIsTargetNode(e.target as HTMLElement);
      if (!node) {
        setSelected(undefined);
        return false;
      }
      const key = node.dataset[targetKeyName]!;
      const nodeObj = getTreeNode(key);
      setSelected(nodeObj);
      saveSelectedNode({ key, node: nodeObj });
      return nodeObj;
    },
    [getTreeNode, saveSelectedNode]
  );

  const handleCreateByDbClick = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = handleSetSelected(e);
      optsMethods.create(target || undefined, [e.clientX, e.clientY]);
    },
    [optsMethods, handleSetSelected]
  );

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      setOpenCtxMenu(true);
      setCtxPos([e.clientX, e.clientY]);
      handleSetSelected(e);
    },
    [handleSetSelected]
  );

  const ctxMenuHandlers = useMemo<ContextMenuHandlers>(() => {
    const { create, copy, cut, paste, del, edit, addText } = optsMethods;
    return {
      onCreate: () => create(selected, ctxPos),
      onCopy: () => copy(selected),
      onCut: () => cut(selected!),
      onPaste: () => paste(selected!, ctxPos),
      onDelete: () => del(selected!, true),
      onEdit: () => edit(selected!),
      onContent: () => addText(selected),
    };
  }, [optsMethods, selected, ctxPos]);

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const res = handleSetSelected(e);
      !res && setOpenCtxMenu(false);
    },
    [handleSetSelected]
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
        onDoubleClick={handleCreateByDbClick}>
        {!dragNodes.length ? null : dragNodes}
      </section>
    </ContextMenu>
  );
};

export default ViewOperations;
