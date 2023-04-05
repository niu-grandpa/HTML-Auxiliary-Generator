import { TreeDataNode } from 'antd';
import { create } from 'zustand';

type Props = {
  node: TreeDataNode | null;
  deleteKey: string;
  selectedKey: string;
  treeData: TreeDataNode[];
  update: (node: TreeDataNode) => void;
  delete: (key: string) => void;
  saveTreeData: (data: TreeDataNode[]) => void;
  saveSelectedKey: (key: string) => void;
};

/** 使得树节点在两个组件间能够进行数据修改 */
export const useTreeDataModel = create<Props>(set => ({
  node: null,
  deleteKey: '',
  selectedKey: '',
  treeData: [],
  update: (node: TreeDataNode) => set(() => ({ node })),
  delete: (key: string) => set(() => ({ deleteKey: key })),
  saveTreeData: (data: TreeDataNode[]) => set(() => ({ treeData: data })),
  saveSelectedKey: (key: string) => set(() => ({ selectedKey: key })),
}));
