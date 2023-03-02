import { type TreeDataNode } from 'antd';
import { VNode } from './runtime-transform';
import { createRootKey } from './utils';

const generate = _generate_();
export default generate;
/**
 * 生成VNode树
 */
function _generate_() {
  // { key: VNode, ... }
  const map = new Map<number, TreeDataNode[]>();
  const getKey = createRootKey();

  /**
   * 创建vnode节点
   * @param tagName 标签名
   * @returns {VNode}
   */
  function createVNode(tagName: string, key: number): VNode {
    const node: VNode = {
      key,
      tagName,
      props: {},
      children: [],
    };
    return node;
  }

  /**
   * 创建tree文件列表节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createFileListNode(tag: string, isLeaf: boolean): TreeDataNode {
    return {
      key: getKey(),
      isLeaf,
      title: tag,
      children: [],
    };
  }

  /**
   * antd Tree节点转换为vnode
   * @param node
   */
  function filListNodeToVNode(node: TreeDataNode[]): VNode[] {
    return [];
  }

  return {
    createVNode,
    filListNodeToVNode,
    createFileListNode,
  };
}
