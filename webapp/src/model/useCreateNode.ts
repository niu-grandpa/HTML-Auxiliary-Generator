import { create } from 'zustand';
import { type FormOfNodeValues } from '../components/ModalFormOfNode/ModalFormOfNodeItem';

type Props = {
  open: boolean;
  setOpenModal: (open: boolean) => void;
  createNode: (data: FormOfNodeValues, pos?: [number, number]) => void;
};

/**
 * 组件间可以共享创建节点的方法
 */
export const useCreateNodeModel = create<Props>(set => ({
  open: false,
  setOpenModal: (open: boolean) => set({ open }),
  /**
   * @param data 所需创建的数据
   * @param pos 节点创建所在的坐标
   */
  createNode: (data: FormOfNodeValues, pos?: [number, number]) => {},
}));
