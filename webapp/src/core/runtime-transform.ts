import { getKebabCase2 } from '../utils';
import { NodeType } from './runtime-generate';
import { type VNode } from './utils';

export type TransformOptions = {
  /**空格起始位置 */
  space: number;
  /**缩进距离 */
  indentation: number;
  /**样式语法糖风格 */
  styleType: 'inline' | 'classname' | string;
  /**事件语法糖风格 */
  sugar: 'default' | 'vue' | 'react' | string;
};

export const SELF_CLOSING_TAG = ['br', 'hr', 'img', 'input'];
const propsWithoutUnits = ['opacity', 'zoom', 'fontWeight', 'scale'];

export function transform(
  dragVnodes: VNode[],
  options: TransformOptions
): string {
  const html: string[] = [];
  if (options.styleType === 'classname') {
    processHTMLOuterStyle(dragVnodes, html);
  }
  processHTMLBody(dragVnodes, html, options);
  return html.join('');
}

function processHTMLBody(
  dragVnodes: VNode[],
  html: string[],
  options: TransformOptions
): string[] {
  const { space, indentation, styleType, sugar } = options;

  const addNewline = () => html.push('\n');
  const addContent = (s: string) => html.push(s);

  const processTag = (
    key: string,
    startTag: string,
    props: VNode['props'] & { actualPos: [number, number] },
    len: number,
    selfClose: boolean
  ) => {
    const { style, className, id, attributes, actualPos } = props!;
    // <div> -> <div , <input /> -> <input
    startTag = startTag.substring(0, len);

    if (id) startTag += ` id="${id}"`;

    const clsKey = sugar === 'react' ? 'className' : 'class';
    if (styleType === 'classname' && !className) {
      startTag += ` ${clsKey}="${key}"`;
    } else if (className) {
      startTag += ` ${clsKey}="${className}"`;
    }

    if (attributes.length) {
      for (const { name, value } of attributes) {
        startTag += ` ${name}="${value}"`;
      }
    }

    let inlineStyle = '';

    if (style && Object.keys(style).length) {
      style.translate = `${actualPos[0]}px ${actualPos[1]}px`;

      if (styleType === 'inline') {
        if (sugar === 'react') {
          startTag += ` style={${JSON.stringify(style)}}`;
        } else {
          for (const key in style) {
            // @ts-ignore
            const styleVal = style[key] as string | number;
            if (isInvalidCSSValue(styleVal)) continue;
            inlineStyle += `${getKebabCase2(key)}: ${normalizeCSSUnit(
              key,
              styleVal
            )}; `;
          }
          startTag += ` style="${inlineStyle.trimEnd()}"`;
        }
      }
    }

    startTag += `${selfClose ? ' />' : '>'}`;
    return startTag;
  };

  const whiteSpace = ' '.repeat(space);

  for (const {
    type,
    tag,
    props,
    children,
    content,
    actualPos,
    key,
  } of dragVnodes) {
    if (type === NodeType.TEXT) {
      addContent(`${whiteSpace}${content}`);
      addNewline();
      continue;
    }

    const isSingle = type === NodeType.SINGLE;

    let startTag = isSingle ? `<${tag} />` : `<${tag}>`;
    let endTag = '';

    if (props !== null) {
      startTag = processTag(
        key,
        startTag,
        { ...props, actualPos },
        tag.length + 1,
        isSingle
      );
    }

    addContent(`${whiteSpace}${startTag}`);

    if (isSingle) {
      addNewline();
      continue;
    }

    if (children.length) {
      addNewline();
      processHTMLBody(children, html, {
        space: space + indentation,
        indentation,
        styleType,
        sugar,
      });
    }

    endTag = `${children.length ? whiteSpace : ''}</${tag}>`;
    addContent(endTag);
    addNewline();
  }

  return html;
}

function processHTMLOuterStyle(dragVnodes: VNode[], html: string[]) {
  const classNames: string[] = [];

  const addNewline = () => html.push('\n');
  const addContent = (s: string) => html.push(s);

  addContent(`<style>`);
  addNewline();

  const dfs = (perfix: string, nodes: VNode[]) => {};

  dfs('', dragVnodes);

  addContent('</style>');
  addNewline();
  addNewline();
}

function processScript() {}

function normalizeCSSUnit(key: string, styleVal: string | number) {
  if (typeof styleVal === 'number') {
    if (!propsWithoutUnits.includes(key)) styleVal = `${styleVal}px`;
    return styleVal;
  }
  return styleVal;
}

function isInvalidCSSValue(value: any) {
  if (
    value === undefined ||
    (typeof value === 'string' && (value === '' || value.trim() === ''))
  ) {
    return true;
  }
  return false;
}
