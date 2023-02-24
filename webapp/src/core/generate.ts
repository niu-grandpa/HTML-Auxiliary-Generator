import { type TreeDataNode } from 'antd';
import { type VNode } from '.';

/**
 * 生成VNode树
 */
export function generate() {
  // { key: VNode, ... }
  const treeMap = new Map<number, VNode>();
  const date = new Date();
  const base = 1013;

  let timestamp =
    date.getFullYear() +
    date.getMonth() +
    date.getDay() +
    date.getHours() +
    date.getMinutes() +
    date.getSeconds();

  let n = 0;

  /**
   * 创建vnode节点
   * @param tagName 标签名
   * @returns {VNode}
   */
  function createVNode(tagName: string): VNode {
    const key = (timestamp + ++n) % base;
    const node: VNode = {
      key,
      tagName,
      props: {},
      children: [],
    };
    treeMap.set(key, node);
    return node;
  }

  /**
   * 转换为antd Tree组件所需数据的结构
   * @param {VNode} node
   * @param {boolean} isLeaf 是否为叶子节点
   * @returns {TreeDataNode}
   */
  function vnodeToTreeNode(node: VNode, isLeaf: boolean): TreeDataNode {
    const { tagName, key } = node;
    return {
      key,
      isLeaf,
      title: tagName,
      children: [],
    };
  }

  function treeNodeToVNode() {}

  return { createVNode, vnodeToTreeNode, treeNodeToVNode };
}
