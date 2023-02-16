import { type VNode } from '.';

/**
 * 生成VNode树
 */
export function generate() {
  // { tagName: VNode, ... }
  const record = new Map<string, VNode>();

  /**
   * 创建vnode节点
   * @param fileName 容器名字
   * @param tagName 标签名
   * @returns {VNode}
   */
  function createNode(fileName: string, tagName: string): VNode {
    const node: VNode = {
      tagName,
      children: [],
      key: fileName,
      props: {},
    };
    if (!record.has(fileName)) {
      record.set(fileName, node);
      console.log('节点记录中已有重复容器名');
    }
    return node;
  }

  return { createNode };
}
