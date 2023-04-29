import { TreeDataNode } from 'antd';
import { FormOfNodeValues } from '../components/ModalCreateNode/ModalFormOfNodeItem';

export type ProcessTreeDataNode = TreeDataNode & VNode & FormOfNodeValues;

export const enum NodeType {
  CONTAINER,
  SINGLE,
  TEXT,
}

export type VNode = {
  type: NodeType;
  key: string;
  tag: string;
  children: VNode[];
  actualPos: number[];
  content: string;
  props: {
    id?: string;
    className?: string;
    /**画布元素相对浏览器的实际位置 [x,y]*/
    actualPos: number[];
    draggable?: boolean;
    style: React.CSSProperties;
    'data-drag-vnode-uuid'?: string;
    'data-is-drag-target'?: boolean;
    attributes: { name: string; value: string }[];
  } | null;
};
