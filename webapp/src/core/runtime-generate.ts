import { TreeDataNode } from 'antd';
import { FormOfNodeValues } from '../components/ModalCreateNode/ModalFormOfNodeItem';
import { transform, TransformOptions } from './runtime-transform';
import { NodeType, ProcessTreeDataNode, VNode } from './type';
import { createDragVnode, createNodeKey } from './utils';

const generate = _generate_();
const savedKeys: number[] = [];
export { generate, savedKeys };

function _generate_() {
  /**
   * 创建antd tree节点
   */
  function createAntTreeNode({
    type,
    value,
    alias,
    className,
    identity,
    style,
    attributes,
    content,
  }: FormOfNodeValues & {
    style?: Partial<CSSStyleDeclaration>;
  }): ProcessTreeDataNode {
    const tag = value;
    const key = createNodeKey();
    const isText = type === NodeType.TEXT;
    const __alias = isText ? content : alias || value || content;
    const extra = {
      tag,
      type,
      content,
      alias: __alias,
      actualPos: [0, 0],
      props: {
        draggable: true,
        id: identity ?? undefined,
        'data-drag-vnode-uuid': key,
        'data-is-drag-target': true,
        attributes: attributes ?? [],
        className: className ?? undefined,
        style: { position: 'absolute', ...style },
      },
    };
    const node = {
      key,
      ...extra,
      children: [],
      title: isText ? content : value,
      isLeaf: isText || type === NodeType.SINGLE,
    };
    // @ts-ignore
    return node;
  }

  /**
   * antd Tree节点转换为dragVnode
   */
  function antTreeNodeToVNode(root: ProcessTreeDataNode[]): VNode[] {
    const vnodes = Array<VNode>(root.length);

    const createNode = (node: TreeDataNode): VNode => {
      const { title, key, children, type, props, content, actualPos } =
        node as ProcessTreeDataNode;
      const dragVnode = createDragVnode(
        key,
        type,
        title as string,
        content,
        props,
        actualPos,
        children?.length
          ? antTreeNodeToVNode(children as ProcessTreeDataNode[])
          : []
      );
      return dragVnode;
    };

    let left = 0;
    let right = root.length - 1;

    while (left <= right) {
      vnodes[left] = createNode(root[left++]);
      vnodes[right] = createNode(root[right--]);
    }

    return vnodes;
  }

  /**
   * 根据vnode树构建html字符串
   */
  function buildHTMLString(
    vnodes: VNode[],
    options: TransformOptions
  ): string[] {
    const res = transform(vnodes, options);
    return res;
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
