import { Key } from 'react';

export type VNode = {
  key: Key;
  tag: string;
  // antd Tree组件的数据结构决定了children不存在是字符串的情况
  children: VNode[];
  props: Partial<{
    style: Partial<CSSStyleDeclaration>;
    attrs: Record<string, any>;
  }> | null;
};

/**
 * 创建文件列表树的根节点key，且其后代也应用该key，由它开始自增
 * @returns {() => number}
 */
export function createRootKey(): () => number {
  const base = 1013;
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDay();

  let num = 0;

  return () => {
    let timestamp = y + m + d + date.getHours() + date.getMinutes() + date.getSeconds();
    return (timestamp + num++) % base;
  };
}

export function h(tag: string, props: VNode['props'], children: VNode[], key: Key): VNode {
  return {
    key,
    tag,
    props,
    children,
  };
}
