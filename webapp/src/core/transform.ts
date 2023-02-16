import { Key } from 'react';
import { getBackspace, getKebabCase2 } from '../utils';

export type VNode = {
  key: Key;
  tagName: string;
  children: Array<string | VNode>;
  props?: Partial<{
    style: Partial<CSSStyleDeclaration>;
    attrs: Record<string, any>;
  }>;
};

const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

/**
 * 转换节点对象为HTML字符串模板
 * @param {object} node
 * @returns {string}
 */
export function transform(node: VNode): string {
  const memo = new Map<string, string>();
  let template = '';

  const transformToHTMLString = (node: VNode, tab = 0, tmp = '') => {
    const { tagName, children, props } = node;
    const backspace = getBackspace(tab++);

    const joinTag = (str: string) => {
      tmp += str;
      template += str;
    };
    // 自闭合标签，不用处理孩子内容
    if (SELF_CLOSING_TAG.includes(tagName)) {
      joinTag(generateTag({ name: tagName, backspace, close: true }));
      return tmp;
    }
    // 拼接开始标签
    joinTag(generateTag({ name: tagName, backspace, props }));

    // 处理父标签下嵌套的子标签
    for (const n of children) {
      // 文字内容直接拼接
      if (typeof n === 'string') {
        const content = `${getBackspace(tab + 1)}${n}\n`;
        joinTag(content);
        continue;
      }
      // 递归处理子节点对象
      const nodeStr = JSON.stringify(n);
      // 剪枝: 每次递归前先获取哈希表的缓存，
      // 如果当前准备进行的递归在之前已进行过，则使用缓存结果避免重复递归
      if (memo.has(nodeStr)) {
        template += memo.get(nodeStr);
        continue;
      }
      const result = transformToHTMLString(n, tab + 1);
      memo.set(nodeStr, result);
    }
    // 结束标签
    joinTag(generateTag({ name: tagName, backspace, end: true }));
    return tmp;
  };

  transformToHTMLString(node);
  return template;
}

function generateTag(obj: {
  name: string;
  backspace: string;
  props?: VNode['props'];
  end?: boolean;
  close?: boolean;
}): string {
  const { backspace, end, name, close, props } = obj;
  const str = `${backspace}<${end ? '/' : ''}${name}${close ? ' /' : ''}>`;
  const tagName = joinProps(str, props, end) + '\n';
  return tagName;
}

function joinProps(tagName: string, props: VNode['props'], endTag?: boolean): string {
  if (!props || endTag) return tagName;

  const { attrs, style } = props;
  const isSelfClose = tagName.endsWith(' />');
  const endPosi = tagName.length - (isSelfClose ? 3 : 1);
  let newTag = tagName.substring(0, endPosi);

  if (attrs) {
    for (const key in attrs) {
      const value = attrs[key];
      newTag += ` ${getKebabCase2(key)}="${value}"`;
    }
  }
  if (style) {
    let inlineStyle = ' style=';
    for (const key in style) {
      const value = style[key as any];
      inlineStyle += `"${getKebabCase2(key)}: ${value};"`;
    }
    newTag += inlineStyle;
  }

  return newTag + `${isSelfClose ? ' />' : '>'}`;
}
