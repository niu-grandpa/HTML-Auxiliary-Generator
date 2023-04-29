import { TreeDataNode, message } from 'antd';
import { cloneDeep, isEqual, isUndefined } from 'lodash';
import {
  FC,
  MouseEvent as ReactMouseEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContextMenu } from '../../../components/ContextMenu';
import core, { calcActualPos, renderDragVnode } from '../../../core';
import { NodeType, ProcessTreeDataNode } from '../../../core/type';
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

  const [curKey, setCurKey] = useState('');
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [nodeType, setNodeType] = useState<NodeType>(0);
  const [copyNode, setCopyNode] = useState<TreeDataNode | undefined>(undefined);

  const canPaste = useMemo(() => isUndefined(copyNode), [copyNode]);

  const dragNodes = useMemo(() => {
    const vnodes = antTreeNodeToVNode(treeData);
    saveDragVnodes(cloneDeep(vnodes));
    return renderDragVnode(vnodes);
  }, [treeData, saveDragVnodes]);

  const getTreeNode = useCallback(
    (key: string) => {
      const current = findNode(treeData, key);
      return cloneDeep(current) as ProcessTreeDataNode;
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
      noticeUpdateNode(current as ProcessTreeDataNode);
    },
    [getTreeNode, noticeUpdateNode, setNodePosData]
  );

  const optsMethods = useMemo(
    () => ({
      create() {},
      del: (treeNode: TreeDataNode, restCopy = true) => {
        setCurKey('');
        noticeDeleteNode(treeNode as ProcessTreeDataNode);
        restCopy && optsMethods.copy(undefined);
      },
      copy: (treeNode?: TreeDataNode) => {
        setCopyNode(treeNode ? cloneDeep(treeNode) : undefined);
      },
      cut: (treeNode: TreeDataNode) => {
        if (isEqual(treeData.length, 1)) {
          message.info('需要节点数量大于1');
          return;
        }
        optsMethods.copy(treeNode);
        optsMethods.del(treeNode, false);
      },
      paste: (treeNode: TreeDataNode, mouseX: number, mouseY: number) => {
        const c = cloneDeep(copyNode)!;
        resolveKeyConflicts(c);
        if (isUndefined(treeNode)) {
          const { left, top } = wrapperElem.current!.getBoundingClientRect();
          setNodePosData(c, mouseX - left - 50, mouseY - top - 90);
          noticePushNode(c as ProcessTreeDataNode);
        } else {
          const parentDom = getDomByNodeKey(treeNode.key as string);
          const [x, y] = getStringPxToNumber(parentDom.style.translate);
          setNodePosData(
            c,
            mouseX - x - 20,
            mouseY - y - parentDom.offsetHeight + 10
          );
          treeNode.children?.push(c);
          noticeUpdateNode(treeNode as ProcessTreeDataNode);
        }
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

  const optionsEvent = useCallback(
    (type: 'create' | 'copy' | 'cut' | 'del' | 'paste', ev?: any) => {
      const treeNode = getTreeNode(curKey)!;

      if (type === 'paste') {
        const { domEvent } = ev;
        optsMethods.paste(treeNode, domEvent.clientX, domEvent.clientY);
        // setCopyNode(undefined);
      } else {
        optsMethods[type](treeNode);
      }
    },
    [curKey, getTreeNode, optsMethods]
  );

  const handleCreate = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      setOpenCtxMenu(true);
      const node = getIsTargetNode(e.target as HTMLElement);
      if (!node) {
        setCurKey('');
        return false;
      }
      const key = node.dataset[targetKeyName]!;
      const nodeObj = getTreeNode(key);
      setCurKey(key);
      setNodeType(nodeObj.type);
    },
    [getTreeNode]
  );

  const handleMenuClick = useCallback((key: string) => {}, []);

  const handleNodeClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const node = getIsTargetNode(e.target as HTMLElement);
      if (!node) {
        setCurKey('');
        setOpenCtxMenu(false);
        saveSelectedNode({ key: '', node: null });
        return false;
      }
      const key = node.dataset[targetKeyName]!;
      saveSelectedNode({ key, node: getTreeNode(key) });
    },
    [saveSelectedNode, getTreeNode]
  );

  return (
    <ContextMenu
      open={openCtxMenu}
      onClick={handleMenuClick}
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
