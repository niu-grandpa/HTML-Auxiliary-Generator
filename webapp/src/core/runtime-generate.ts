import { type TreeDataNode } from 'antd';
import { CreateNodeResult } from '../components/ModalCreateNode';
import transform from './runtime-transform';
import { createDragVnode, createNodeKey, type VNode } from './utils';

export const enum NodeType {
  CONTAINER,
  SINGLE,
  TEXT,
}

const generate = _generate_();
const savedKeys: number[] = [];
export { generate, savedKeys };

function _generate_() {
  /**
   * 创建antd tree节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createAntTreeNode(
    data: CreateNodeResult & { style?: Partial<CSSStyleDeclaration> }
  ): TreeDataNode {
    const { type, leaf, value, alias, className, identity, style } = data;
    const node = {
      type,
      isLeaf: leaf,
      title: value,
      children: [],
      alias: alias || value,
      props: {
        className: className || null,
        id: identity || null,
        style: style || null,
      },
      key: createNodeKey(),
    };
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
      const { title, key, isLeaf, children, type, props } = node;
      const dragVnode = createDragVnode(
        key as string,
        type,
        title as string,
        props,
        []
      );

      if (isLeaf || !children?.length) return dragVnode;

      dragVnode.children = antTreeNodeToVNode(children as TreeDataNode[]);
      return dragVnode;
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
