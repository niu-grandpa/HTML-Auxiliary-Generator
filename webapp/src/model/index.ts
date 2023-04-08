import { TreeDataNode } from 'antd';
import { create } from 'zustand';
import { VNode } from '../core/utils';

type NodeType = TreeDataNode | null | undefined;
type NodeInfo = { key: string; node: NodeType };

type Props = {
  node: NodeType;
  newNode: NodeType;
  deleteNode: NodeType;
  selectedNode: NodeInfo;
  treeData: TreeDataNode[];
  dragVnodes: VNode[];
  push: (node: NodeType) => void;
  update: (node: NodeType) => void;
  delete: (key: NodeType) => void;
  saveTreeData: (data: TreeDataNode[]) => void;
  saveDragVnodes: (vnodes: VNode[]) => void;
  saveSelectedNode: (info: NodeInfo) => void;
};

/** 使得树节点在两个组件间能够进行数据修改 */
export const useTreeDataModel = create<Props>(set => ({
  node: null,
  newNode: null,
  deleteNode: null,
  selectedNode: { key: '', node: null },
  treeData: [],
  dragVnodes: [],
  push: (node: NodeType) => set(() => ({ newNode: node })),
  update: (node: NodeType) => set(() => ({ node })),
  delete: (node: NodeType) => set(() => ({ deleteNode: node })),
  saveTreeData: (data: TreeDataNode[]) => set(() => ({ treeData: data })),
  saveDragVnodes: (vnodes: VNode[]) => set(() => ({ dragVnodes: vnodes })),
  saveSelectedNode: (selectedNode: NodeInfo) => set(() => ({ selectedNode })),
}));
