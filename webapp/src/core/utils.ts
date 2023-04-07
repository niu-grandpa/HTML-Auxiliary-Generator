import { TreeDataNode } from 'antd';
import { CSSProperties } from 'react';
import { NodeType, savedKeys as SAVED_KEYS } from './runtime-generate';

export type VNode = {
  type: NodeType;
  key: string;
  tag: string;
  children: VNode[];
  content: string;
  actualPos: [number, number];
  props: {
    id: string;
    className: string;
    style: CSSProperties;
    attributes: { name: string; value: string }[];
  } | null;
};

let uid = 0,
  timestamp = Date.now();
export function createNodeKey(): string {
  while (SAVED_KEYS.includes(uid)) {
    ++uid;
  }
  SAVED_KEYS.push(uid);
  return `${uid}-${timestamp++}`;
}

// 解决复制的节点 key 冲突
export function resolveKeyConflicts(node: TreeDataNode) {
  const newKey = createNodeKey();
  node.key = newKey;
  // @ts-ignore
  node.props['data-drag-vnode-uuid'] = newKey;
  if (node.isLeaf || !node.children?.length) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    resolveKeyConflicts(child);
  }
  return node;
}

/**创建拖动节点——虚拟节点 */
export function createDragVnode(
  key: string,
  type: NodeType,
  tag: string,
  content: string,
  props: VNode['props'],
  actualPos: [number, number],
  children: VNode[]
): VNode {
  return {
    key,
    type,
    tag,
    content,
    props,
    children,
    actualPos,
  };
}
