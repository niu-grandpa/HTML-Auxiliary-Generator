import { TreeDataNode } from 'antd';
import { Key } from 'react';
import { NodeType, savedKeys as SAVED_KEYS } from './runtime-generate';

export type VNode = {
  type: NodeType;
  key: Key;
  tag: string;
  // antd Tree组件的数据结构决定了children不存在是字符串的情况
  children: VNode[];
  props: {
    attrs?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
  } | null;
};

let uid = 0;
export function createNodeKey() {
  while (SAVED_KEYS.includes(uid)) {
    uid++;
  }
  SAVED_KEYS.push(uid);
  SAVED_KEYS.sort((a, b) => a - b);
  return uid;
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

export function h(
  type: NodeType,
  tag: string,
  props: VNode['props'],
  children: VNode[],
  key: Key
): VNode {
  return {
    type,
    key,
    tag,
    props,
    children,
  };
}
