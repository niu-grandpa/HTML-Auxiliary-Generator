import { type TreeDataNode } from 'antd';
import { FormOfNodeValues } from '../components/ModalFormOfNodeItem';
import { transform } from './runtime-transform';
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
   */
  function createAntTreeNode(
    values: FormOfNodeValues & { style?: Partial<CSSStyleDeclaration> }
  ): TreeDataNode {
    const { type, leaf, value, alias, className, identity, style, attributes } =
      values;
    const node = {
      type,
      isLeaf: leaf,
      title: value,
      children: [],
      alias: alias || value,
      props: {
        id: identity || null,
        style: style || null,
        className: className || null,
        attributes,
      },
      key: createNodeKey(),
    };
    return node;
  }

  /**
   * antd Tree节点转换为vnode
   */
  function antTreeNodeToVNode(root: TreeDataNode[]): VNode[] {
    const vnodes = Array<VNode>(root.length);

    const createVnode = (node: TreeDataNode): VNode => {
      // @ts-ignore
      const { title, key, children, type, props } = node;
      const dragVnode = createDragVnode(
        key as string,
        type,
        title as string,
        props,
        children?.length ? antTreeNodeToVNode(children as TreeDataNode[]) : []
      );
      return dragVnode;
    };

    let left = 0;
    let right = root.length - 1;

    while (left <= right) {
      vnodes[left] = createVnode(root[left++]);
      vnodes[right] = createVnode(root[right--]);
    }

    return vnodes;
  }

  /**
   * 根据vnode树构建html字符串
   */
  function buildHTMLString(vnodes: VNode[]): string {
    const res = transform(vnodes);
    return res;
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
