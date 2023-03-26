import { getKebabCase2 } from '../utils';
import { NodeType } from './runtime-generate';
import { type VNode } from './utils';

export const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

export function transform(dragVnodes: VNode[]): string {
  const html: string[] = [];
  toArrayOfStrings(dragVnodes, html, html.slice());
  return formatHtml(html);
}

function toArrayOfStrings(
  dragVnodes: VNode[],
  res: string[],
  temp: string[]
): string[] {
  for (const node of dragVnodes) {
    const { type, tag, props, children } = node;
    if (type === NodeType.TEXT) {
      temp.push(tag);
      continue;
    }
    const isSelfClose = SELF_CLOSING_TAG.includes(tag);
    temp.push(`${isSelfClose ? `<${tag} />` : `<${tag}>`}`);
    if (props !== null) {
      const { style, className, id, attributes } = props;
      // <div> -> <div , <input /> -> <input
      let startTag = temp.pop()!.substring(0, tag.length + 1);
      if (id) {
        startTag += ` id="${id}"`;
      }
      if (className) {
        startTag += ` class="${className}"`;
      }
      if (style && Object.keys(style).length) {
        let inline = ' style=';
        for (const key in style) {
          // @ts-ignore
          const value = style[key];
          inline += `${getKebabCase2(key)}=" ${value}"; `;
        }
        startTag += inline.trimEnd();
      }
      if (attributes.length) {
        for (const { name, value } of attributes) {
          startTag += ` ${name}="${value}"`;
        }
      }
      startTag += `${isSelfClose ? ' />' : '>'}`;
      temp.push(startTag);
    }
    if (children.length) toArrayOfStrings(children, res.slice(), temp);
    if (!isSelfClose) temp.push(`</${tag}>`);
  }
  res.push(temp.join(''));
  return res;
}

function formatHtml(html: string[]) {
  console.log(html.join(''));
  return '';
}
