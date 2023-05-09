import {
  CodepenOutlined,
  CoffeeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { TreeDataNode } from 'antd';
import { eq } from 'lodash';
import { createElement } from 'react';
import { create } from 'zustand';
import { __defaultValues } from '../components/ModalCreateNode';
import { type FormOfNodeValues } from '../components/ModalCreateNode/ModalFormOfNodeItem';
import core from '../core';
import { NodeType } from '../core/type';
import { getHeaderHeight } from '../utils';
import { NodeType as ProcessTreeDataNode } from './type';

type Props = {
  open: boolean;
  edit: boolean;
  addText: boolean;
  coordinate: number[];
  target: ProcessTreeDataNode;
  nodeData: ProcessTreeDataNode[];
  closeModal: () => void;
  updateNodeData: (data: ProcessTreeDataNode[]) => void;
  setCoordinate: (coordinate: number[]) => void;
  openModal: (
    target: ProcessTreeDataNode,
    edit: boolean,
    addText?: boolean
  ) => void;
  createNode: (data: FormOfNodeValues, pos?: [number, number]) => void;
};

const { createAntTreeNode, updateAntTree } = core;

const nodeIcons = {
  0: () => createElement(CodepenOutlined),
  1: () => createElement(CoffeeOutlined),
  2: () => createElement(FileTextOutlined),
};
/**
 * 组件间可以共享创建节点的方法
 */
export const useCreateNodeModel = create<Props>((set, get) => ({
  open: false,
  edit: false,
  target: null,
  addText: false,
  nodeData: [],
  coordinate: [],
  closeModal: () => set({ open: false, target: null, coordinate: [] }),
  openModal: (
    target: ProcessTreeDataNode,
    edit: boolean,
    addText?: boolean
  ) => {
    return set({ target, edit, open: true, addText });
  },
  setCoordinate: (coordinate: number[]) => {
    coordinate[1] = coordinate[1] - getHeaderHeight();
    return set({ coordinate });
  },
  updateNodeData: (data: ProcessTreeDataNode[]) => set({ nodeData: data }),
  createNode: (data: FormOfNodeValues) => {
    const { edit, target, nodeData, coordinate } = get();
    const _createAntTreeNode = (data: FormOfNodeValues) => {
      const node = createAntTreeNode(data);
      if (coordinate.length) {
        node.props!.style.translate = `${~~coordinate[0]}px ${~~coordinate[1]}px`;
      }
      node.icon = nodeIcons[node.type];
      return node;
    };

    const processNodeContent = (
      node: ProcessTreeDataNode,
      type: NodeType,
      content: string
    ): ProcessTreeDataNode => {
      if (eq(type, NodeType.TEXT) || !content) return node;
      const textNode = _createAntTreeNode({
        ...__defaultValues,
        type: NodeType.TEXT,
        leaf: true,
        content,
      });
      node!.children.push(textNode);
      return node;
    };

    const updateNodeData = (
      nodeData: ProcessTreeDataNode[],
      data: FormOfNodeValues,
      target: ProcessTreeDataNode
    ) => {
      if (!target) return nodeData;
      const { style, actualPos } = target.props!;
      const { value, alias, className, identity, attributes, content } = data;
      // 1.修改节点标签
      if (eq(edit, true)) {
        target.title = value;
        target.content = content;
        target.alias = alias || value || content;
        target.props = {
          style,
          actualPos,
          className,
          attributes,
          id: identity,
        };
        // @ts-ignore
        return updateAntTree(nodeData, target);
      }
      // 2.新增节点
      const n = processNodeContent(_createAntTreeNode(data), type, content);
      target!.children.push(n as TreeDataNode);
      // @ts-ignore
      return updateAntTree(nodeData, target);
    };

    let _nodeData = nodeData.slice(),
      { repeat, content, type } = data;

    while (repeat--) {
      if (!target) {
        _nodeData.push(
          processNodeContent(_createAntTreeNode(data), type, content)
        );
        continue;
      }
      _nodeData = updateNodeData(_nodeData, data, target);
    }

    set({ edit: false, target: null, nodeData: _nodeData });
  },
}));
