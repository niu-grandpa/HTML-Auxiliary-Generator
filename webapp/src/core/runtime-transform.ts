import { getBackspace, getKebabCase2 } from '../utils';
import { NodeType } from './runtime-generate';
import { type VNode } from './utils';

export const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

const memo = new Map<string, string>();

/**
 * 转换节点对象为HTML字符串模板
 * @param {object} node
 * @returns {string}
 */
export default function transform(node: VNode): string {
  let template = '';

  const toHTMLString = (node: VNode, tab = 0, currentLevelResult = '') => {
    const { type, tag, children, props } = node;
    const backspace = getBackspace(tab++);
    const splicingTag = (tag: string) => {
      currentLevelResult += tag;
      template += tag;
    };
    // 文本节点
    if (type === NodeType.TEXT) {
      splicingTag(tag);
      return '\n' + backspace + currentLevelResult;
    }
    // 自闭合标签，不用处理孩子内容
    if (SELF_CLOSING_TAG.includes(tag)) {
      splicingTag(convertToStr({ tag: tag, backspace, close: true }));
      return currentLevelResult;
    }
    // 拼接开始标签
    splicingTag(convertToStr({ tag: tag, backspace, props }));
    // 处理父标签下嵌套的子标签
    for (const child of children) {
      // 递归处理子节点对象。剪枝: 每次递归前先获取哈希表的缓存，
      // 如果当前准备进行的递归在之前已进行过，则使用缓存结果避免重复递归
      const temp = Object.assign({}, child);
      // 避免key不同，而节点相同结果也相同，导致取缓存失败
      temp.key = 'cache';
      const jsonKey = JSON.stringify(temp);
      if (memo.has(jsonKey)) {
        template += memo.get(jsonKey);
        continue;
      }
      const result = toHTMLString(child, tab + 1);
      memo.set(jsonKey, result);
    }
    // 结束标签
    splicingTag(convertToStr({ tag, backspace, end: true }));
    return currentLevelResult;
  };
  toHTMLString(node);
  return template;
}

function convertToStr(obj: {
  tag: string;
  backspace: string;
  props?: VNode['props'];
  end?: boolean;
  close?: boolean;
}): string {
  const { backspace, end, tag, close, props } = obj;
  const str = `${backspace}<${end ? '/' : ''}${tag}${close ? ' /' : ''}>`;
  const res = '\n' + addProps(str, props || null, end);
  return res;
}

function addProps(
  tag: string,
  props: VNode['props'],
  endTag?: boolean
): string {
  if (props === null || endTag) return tag;

  const { id, style, className } = props;
  const isSelfClose = tag.endsWith(' />');
  const endPosi = tag.length - (isSelfClose ? 3 : 1);

  let res = tag.substring(0, endPosi);

  if (id !== '') {
    id && (res += ` id="${className}"`);
  }
  if (className !== '') {
    res += ` class="${className}"`;
  }
  if (style && Object.keys(style).length) {
    let inlineStyle = ' style=';
    for (const key in style) {
      // @ts-ignore
      const value = style[key];
      inlineStyle += `"${getKebabCase2(key)}: ${value};"`;
    }
    res += inlineStyle;
  }

  return `${res}${isSelfClose ? ' /' : ''}>}`;
}
