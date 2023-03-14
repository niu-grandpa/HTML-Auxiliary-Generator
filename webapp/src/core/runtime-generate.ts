import { type TreeDataNode } from 'antd';
import { useMemoCaches as memoCaches } from '../hooks';
import { createRootKey, h, type VNode } from './utils';

const generate = _generate_();
export default generate;

function _generate_() {
  // { key: VNode, ... }
  const map = new Map<number, TreeDataNode[]>();
  const vnodeMemo = memoCaches();
  const getKey = createRootKey();

  /**
   * 创建antd tree节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createAntTreeNode(tag: string, isLeaf: boolean): TreeDataNode {
    return {
      key: getKey(),
      isLeaf,
      title: tag,
      children: [],
    };
  }

  /**
   * antd Tree节点转换为vnode
   * @param {TreeDataNode[]} root
   * @returns {VNode[]}
   */
  function antTreeNodeToVNode(root: TreeDataNode[]): VNode[] {
    const vdoms = Array<VNode>(root.length);

    const createVnode = (node: TreeDataNode): VNode => {
      const { title, key, isLeaf, children } = node;
      const vnode = h(title as string, null, [], key);
      if (isLeaf) return vnode;
      // todo test
      const nodeWithNoKey = {
        title,
        isLeaf,
        children,
      };
      if (vnodeMemo.get(nodeWithNoKey, cache => (vnode.children = cache))) return vnode;
      vnode.children = antTreeNodeToVNode(children as TreeDataNode[]);
      vnodeMemo.set(nodeWithNoKey, vnode.children);
      return vnode;
    };

    let left = 0;
    let right = root.length - 1;

    while (left <= right) {
      vdoms[left] = createVnode(root[left++]);
      vdoms[right] = createVnode(root[right--]);
    }

    return vdoms;
  }

  /**
   * 根据vnode树构建html字符串
   */
  function buildHTMLString(): string {
    return '';
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
