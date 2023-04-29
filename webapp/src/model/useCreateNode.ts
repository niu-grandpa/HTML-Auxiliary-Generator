import { create } from 'zustand';
import { type FormOfNodeValues } from '../components/ModalFormOfNode/ModalFormOfNodeItem';
import { NodeType } from './type';

type Props = {
  open: boolean;
  nodeData: NodeType;
  closeModal: () => void;
  createNode: (data: FormOfNodeValues, pos?: [number, number]) => void;
};

/**
 * 组件间可以共享创建节点的方法
 */
export const useCreateNodeModel = create<Props>(set => ({
  open: false,
  nodeData: null,
  closeModal: () => set({ open: false }),
  /**
   * @param data 所需创建的数据
   * @param pos 节点创建所在的坐标
   */
  createNode: (data: FormOfNodeValues, pos?: [number, number]) => {
    set({ open: true });
  },
}));
