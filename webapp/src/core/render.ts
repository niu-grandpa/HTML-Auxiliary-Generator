import {
  createElement,
  InputHTMLAttributes,
  type ClassAttributes,
  type Key,
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
      const { type, key, tag, props, children } = vnode;
      let node: ReactNode = null;
      if (type === NodeType.TEXT) {
        const text = tag;
        node = text;
      } else {
        const { id, className, style, attributes } = props!;
        const _props = {
          id,
          style,
          className,
        };
        for (const { name, value } of attributes) {
          // @ts-ignore
          _props[name] = value;
        }
        node = _createElement(
          key,
          tag,
          _props,
          children.length ? traverse(children) : undefined
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
  key: Key,
  type: string,
  props?:
    | ((InputHTMLAttributes<HTMLElement> & ClassAttributes<HTMLElement>) | null)
    | null,
  children?: ReactNode[] | string
): ReactNode {
  const dataset = {
    'data-key': key,
    'data-is-drag-target': true,
  };
  return createElement(type, { ...props, key, ...dataset }, children);
}
