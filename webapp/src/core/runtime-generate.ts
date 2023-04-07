import { type TreeDataNode } from 'antd';
import { FormOfNodeValues } from '../components/ModalFormOfNode/ModalFormOfNodeItem';
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
    const key = createNodeKey();
    const {
      type,
      value,
      alias,
      className,
      identity,
      style,
      attributes,
      content,
    } = values;
    const extra = {
      type,
      content,
      // 由于leaf节点添加的内容不显示下级，因此通过标题显示出来
      alias: type === NodeType.TEXT ? content : alias || value || content,
      // 存储画布元素相对浏览器的实际位置 [x,y]
      actualPos: [0, 0],
      props: {
        id: identity || undefined,
        className: className || undefined,
        attributes: attributes || [],
        style: { position: 'absolute', ...style },
        draggable: true,
        'data-drag-vnode-uuid': key,
        'data-is-drag-target': true,
      },
    };
    const node = {
      isLeaf: type === NodeType.TEXT || type === NodeType.SINGLE,
      title: type === NodeType.TEXT ? content : value,
      children: [],
      key,
      ...extra,
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
      const { title, key, children, type, props, content, actualPos } = node;
      const dragVnode = createDragVnode(
        key as string,
        type,
        title as string,
        content,
        props,
        actualPos,
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
    console.log(res);
    return res;
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
