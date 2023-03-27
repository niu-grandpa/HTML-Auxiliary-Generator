import { TreeDataNode } from 'antd';
import { CSSProperties } from 'react';
import { NodeType, savedKeys as SAVED_KEYS } from './runtime-generate';

export type VNode = {
  type: NodeType;
  key: string;
  tag: string;
  // antd Tree组件的数据结构决定了children不存在是字符串的情况
  children: VNode[];
  content: string;
  props: {
    id: string;
    className: string;
    style: CSSProperties;
    attributes: { name: string; value: string }[];
  } | null;
};

let uid = 0;
export function createNodeKey(): string {
  while (SAVED_KEYS.includes(uid)) {
    uid++;
  }
  SAVED_KEYS.push(uid);
  SAVED_KEYS.sort((a, b) => a - b);
  return `${uid}-${Date.now()}`;
}

// 解决复制的节点 key 冲突
export function resolveKeyConflicts(node: TreeDataNode) {
  node.key = createNodeKey();
  if (node.isLeaf || !node.children?.length) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    resolveKeyConflicts(child);
  }
}

/**创建拖动节点——虚拟节点 */
export function createDragVnode(
  key: string,
  type: NodeType,
  tag: string,
  content: string,
  props: VNode['props'],
  children: VNode[]
): VNode {
  return {
    key,
    type,
    tag,
    content,
    props,
    children,
  };
}
