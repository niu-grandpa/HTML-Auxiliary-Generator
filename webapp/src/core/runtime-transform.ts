import { getKebabCase2 } from '../utils';
import { NodeType } from './runtime-generate';
import { type VNode } from './utils';

export const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];

export function transform(dragVnodes: VNode[]): string {
  const html: string[] = [];
  toHTMLStrings(dragVnodes, html, 0, 2);
  return html.join('');
}

function toHTMLStrings(
  dragVnodes: VNode[],
  html: string[],
  space: number,
  indentation: number
): string[] {
  const addNewline = () => {
    html.push('\n');
  };
  const addContent = (s: string) => {
    html.push(s);
  };
  const processNode = (
    startTag: string,
    props: VNode['props'],
    len: number,
    selfClose: boolean
  ) => {
    const { style, className, id, attributes } = props!;
    // <div> -> <div , <input /> -> <input
    startTag = startTag.substring(0, len);
    if (id) startTag += ` id="${id}"`;
    if (className) startTag += ` class="${className}"`;
    if (style && Object.keys(style).length) {
      let inline = ' style=';
      for (const key in style) {
        // @ts-ignore
        const value = style[key];
        inline += `"${getKebabCase2(key)}: ${value}"; `;
      }
      startTag += inline.trimEnd();
    }
    if (attributes.length) {
      for (const { name, value } of attributes) {
        startTag += ` ${name}="${value}"`;
      }
    }
    startTag += `${selfClose ? ' />' : '>'}`;
    return startTag;
  };

  const whiteSpace = ' '.repeat(space);

  for (const node of dragVnodes) {
    const { type, tag, props, children, content } = node;
    if (type === NodeType.TEXT) {
      addContent(`${whiteSpace}${content}`);
      addNewline();
      continue;
    }
    const isSingle = type === NodeType.SINGLE;
    let startTag = '';
    let endTag = '';
    startTag = isSingle ? `<${tag} />` : `<${tag}>`;
    if (props !== null) {
      startTag = processNode(startTag, props, tag.length + 1, isSingle);
    }
    addContent(`${whiteSpace}${startTag}`);
    if (isSingle) {
      addNewline();
      continue;
    }
    if (children.length) {
      addNewline();
      toHTMLStrings(children, html, space + indentation, indentation);
    }
    endTag = `${children.length ? whiteSpace : ''}</${tag}>`;
    addContent(endTag);
    addNewline();
  }
  return html;
}
