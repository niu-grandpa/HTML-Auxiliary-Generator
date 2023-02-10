import { getBackspace, getKebabCase2 } from '../utils';

export type TreeNode = {
  tag: string;
  node: Array<string | TreeNode>;
  props?: Partial<{
    style: Partial<CSSStyleDeclaration>;
    attrs: Record<string, any>;
  }>;
};

const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

/**
 * 转换节点对象为HTML字符串模板
 * @param {object} root
 * @returns {string}
 */
export function transform(root: TreeNode): string {
  const memo = new Map<string, string>();
  let template = '';

  const transformToHTMLString = (root: TreeNode, tab = 0, tmp = '') => {
    const { tag, node, props } = root;
    const backspace = getBackspace(tab++);

    const joinTag = (str: string) => {
      tmp += str;
      template += str;
    };
    // 自闭合标签，不用处理孩子内容
    if (SELF_CLOSING_TAG.includes(tag)) {
      joinTag(generateTag({ name: tag, backspace, close: true }));
      return tmp;
    }
    // 拼接开始标签
    joinTag(generateTag({ name: tag, backspace, props }));

    // 处理父标签下嵌套的子标签
    for (const n of node) {
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
    joinTag(generateTag({ name: tag, backspace, end: true }));
    return tmp;
  };

  transformToHTMLString(root);
  return template;
}

function generateTag(obj: {
  name: string;
  backspace: string;
  props?: TreeNode['props'];
  end?: boolean;
  close?: boolean;
}): string {
  const { backspace, end, name, close, props } = obj;
  const str = `${backspace}<${end ? '/' : ''}${name}${close ? ' /' : ''}>`;
  const tag = joinProps(str, props, end) + '\n';
  return tag;
}

function joinProps(tag: string, props: TreeNode['props'], endTag?: boolean): string {
  if (!props || endTag) return tag;

  const { attrs, style } = props;
  const isSelfClose = tag.endsWith(' />');
  const endPosi = tag.length - (isSelfClose ? 3 : 1);
  let newTag = tag.substring(0, endPosi);

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
