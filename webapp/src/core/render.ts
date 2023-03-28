import {
  createElement,
  InputHTMLAttributes,
  type ClassAttributes,
  type ReactNode,
} from 'react';
import { NodeType } from './runtime-generate';
import { type VNode } from './utils';

/**
 * 将用于画布上要拖动的虚拟节点渲染为react节点
 * @param vnodes 根据antd-tree组件生成的vnode节点
 * @returns
 */
export function renderDragVnode(vnodes: VNode[]): ReactNode[] {
  return render(vnodes);
}

function render(vnodes: VNode[]): ReactNode[] {
  const traverse = (vnodes: VNode[]) => {
    const len = vnodes.length;
    const reactNodes = Array<ReactNode>(len);

    const getReactNode = (vnode: VNode): ReactNode => {
      const { key, type, tag, props, children, content } = vnode;
      let node: ReactNode = null;
      if (type === NodeType.TEXT) {
        node = content;
      } else {
        const _props: Record<string, any> = { ...props, attributes: null };
        for (const { name, value } of props!.attributes) {
          _props[name] = value;
        }
        node = _createElement(
          key,
          tag,
          _props,
          type === NodeType.SINGLE ? undefined : traverse(children)
        );
      }
      return node;
    };

    let l = 0;
    let h = len - 1;

    while (l <= h) {
      reactNodes[l] = getReactNode(vnodes[l++]);
      reactNodes[h] = getReactNode(vnodes[h--]);
    }

    return reactNodes;
  };

  return traverse(vnodes);
}

function _createElement(
  key: string,
  type: string,
  props?:
    | ((InputHTMLAttributes<HTMLElement> & ClassAttributes<HTMLElement>) | null)
    | null,
  children?: ReactNode[] | string
): ReactNode {
  return createElement(type, { ...props, key }, children);
}
