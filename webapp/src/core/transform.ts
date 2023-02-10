import { getBackspace } from '../utils';

export type Root = Map<string, TreeNode[]>;

export type TreeNode = {
  tag: string;
  dataset?: Record<string, string>;
  attributes?: Record<string, string>;
  node: Array<string | TreeNode>;
};

const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

/**
 * 转换节点对象为HTML字符串模板
 * @param {object} root
 * @returns {string}
 */
export const transformToHTMLString = (root: TreeNode): string => {
  const memo = new Map<string, string>();
  let template = '';

  const transform = (root: TreeNode, tab = 0, tmp = '') => {
    const { tag, node, attributes: attrs } = root;
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
    joinTag(generateTag({ name: tag, backspace, attrs }));

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
      const result = transform(n, tab + 1);
      memo.set(nodeStr, result);
    }
    // 结束标签
    joinTag(generateTag({ name: tag, backspace, end: true }));
    return tmp;
  };

  transform(root);
  return template;
};

const generateTag = (obj: {
  name: string;
  backspace: string;
  attrs?: TreeNode['attributes'];
  end?: boolean;
  close?: boolean;
}): string => {
  const { backspace, end, name, close, attrs } = obj;
  const str = `${backspace}<${end ? '/' : ''}${name}${close ? ' /' : ''}>\n`;
  const tag = addAttributes(str, attrs, end);
  return tag;
};

const addAttributes = (tag: string, attrs: TreeNode['attributes'], endTag?: boolean) => {
  if (!attrs || endTag) return tag;
  // todo
  return tag;
};
