import { create } from 'zustand';
import { VNode } from '../core/type';
import { NodeInfo, NodeType } from './type';

type Props = {
  node: NodeType;
  selectedNode: NodeInfo;
  dragVnodes: VNode[];
  saveDragVnodes: (vnodes: VNode[]) => void;
  saveSelectedNode: (info: NodeInfo) => void;
};

/** 使得树节点在两个组件间能够进行数据修改 */
export const useTreeDataModel = create<Props>(set => ({
  node: null,
  selectedNode: { key: '', node: null },
  dragVnodes: [],
  saveDragVnodes: (vnodes: VNode[]) => set(() => ({ dragVnodes: vnodes })),
  saveSelectedNode: (selectedNode: NodeInfo) => set(() => ({ selectedNode })),
}));
