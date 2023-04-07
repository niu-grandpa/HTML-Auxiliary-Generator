import { TreeDataNode } from 'antd';
import { create } from 'zustand';
import { VNode } from '../core/utils';

type NodeType = TreeDataNode | null | undefined;

type Props = {
  node: NodeType;
  newNode: NodeType;
  deleteNode: NodeType;
  selectedKey: string;
  treeData: TreeDataNode[];
  dragVnodes: VNode[];
  push: (node: NodeType) => void;
  update: (node: NodeType) => void;
  delete: (key: NodeType) => void;
  saveTreeData: (data: TreeDataNode[]) => void;
  saveDragVnodes: (vnodes: VNode[]) => void;
  saveSelectedKey: (key: string) => void;
};

/** 使得树节点在两个组件间能够进行数据修改 */
export const useTreeDataModel = create<Props>(set => ({
  node: null,
  newNode: null,
  deleteNode: null,
  selectedKey: '',
  treeData: [],
  dragVnodes: [],
  push: (node: NodeType) => set(() => ({ newNode: node })),
  update: (node: NodeType) => set(() => ({ node })),
  delete: (node: NodeType) => set(() => ({ deleteNode: node })),
  saveTreeData: (data: TreeDataNode[]) => set(() => ({ treeData: data })),
  saveDragVnodes: (vnodes: VNode[]) => set(() => ({ dragVnodes: vnodes })),
  saveSelectedKey: (key: string) => set(() => ({ selectedKey: key })),
}));
