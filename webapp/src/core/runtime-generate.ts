import { type TreeDataNode } from 'antd';
import transform from './runtime-transform';
import { createRootKey, h, type VNode } from './utils';

export const enum NodeType {
  CONTAINER,
  SINGLE,
  TEXT,
}

const generate = _generate_();
export default generate;

function _generate_() {
  const getKey = createRootKey();

  /**
   * 创建antd tree节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createAntTreeNode(tag: string, isLeaf: boolean, type: NodeType): TreeDataNode {
    const node = {
      key: getKey(),
      isLeaf,
      title: tag,
      children: [],
    };
    // @ts-ignore
    node['type'] = type;
    return node;
  }

  /**
   * antd Tree节点转换为vnode
   * @param {TreeDataNode[]} root
   * @returns {VNode[]}
   */
  function antTreeNodeToVNode(root: TreeDataNode[]): VNode[] {
    const vdoms = Array<VNode>(root.length);

    const createVnode = (node: TreeDataNode): VNode => {
      // @ts-ignore
      const { title, key, isLeaf, children, type } = node;
      const vnode = h(type, title as string, null, [], key);
      if (isLeaf || !children?.length) return vnode;
      vnode.children = antTreeNodeToVNode(children as TreeDataNode[]);
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
  function buildHTMLString(vnodes: VNode[]): string {
    let res = '';
    for (const vnode of vnodes) {
      res += transform(vnode);
    }
    return res;
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
