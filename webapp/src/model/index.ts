import { TreeDataNode } from 'antd';
import { create } from 'zustand';

type NodeType = TreeDataNode | null | undefined;

type Props = {
  node: NodeType;
  deleteNode: NodeType;
  selectedKey: string;
  treeData: TreeDataNode[];
  update: (node: NodeType) => void;
  delete: (key: NodeType) => void;
  saveTreeData: (data: TreeDataNode[]) => void;
  saveSelectedKey: (key: string) => void;
};

/** 使得树节点在两个组件间能够进行数据修改 */
export const useTreeDataModel = create<Props>(set => ({
  node: null,
  deleteNode: null,
  selectedKey: '',
  treeData: [],
  update: (node: NodeType) => set(() => ({ node })),
  delete: (node: NodeType) => set(() => ({ deleteNode: node })),
  saveTreeData: (data: TreeDataNode[]) => set(() => ({ treeData: data })),
  saveSelectedKey: (key: string) => set(() => ({ selectedKey: key })),
}));
