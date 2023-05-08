import { CSSProperties, Key } from 'react';
import { getKebabCase2 } from '../utils';
import { NodeType, VNode } from './type';

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
): string[] {
  const html: string[] = [];
  if (options.styleType === 'classname') {
    processHTMLOuterStyle(dragVnodes, html);
  }
  processBodyHTML(dragVnodes, html, options);
  return html;
}

export function processWhenHTMLExport(
  sugar: TransformOptions['sugar'],
  name: string,
  html: string[]
) {
  const styleTagEndPos = html.indexOf('</style>');
  const ss = styleTagEndPos > -1;
  const commonType = (name: string) => {
    html.splice(
      styleTagEndPos + 1,
      0,
      `${ss ? '\n\n' : ''}<${name}>${!ss ? '\n' : ''}`
    );
    html.push(`</${name}>`);
    return html.join('');
  };
  const reactType = () => {
    html.unshift('<>\n');
    html.push(`    </>`);
    return `function ${name}() {
  return (
    ${html.join('')}
  );
}`;
  };

  return sugar === 'react'
    ? reactType()
    : sugar === 'vue'
    ? commonType('template')
    : commonType('body');
}

function processBodyHTML(
  dragVnodes: VNode[],
  html: string[],
  options: TransformOptions
): string[] {
  const { space, indentation, styleType, sugar } = options;
  const isUseClassName = styleType === 'classname';
  const _space = isUseClassName ? space + 2 : space;

  const addNewline = () => html.push('\n');
  const addContent = (s: string) => html.push(s);

  const dfs = (dragVnodes: VNode[], html: string[], space: number) => {
    const whiteSpace = ' '.repeat(space);
    const processTag = (
      key: string,
      startTag: string,
      props: VNode['props'],
      len: number,
      selfClose: boolean
    ) => {
      const { style, className, id, attributes, actualPos } = props!;
      const clsKey = sugar === 'react' ? 'className' : 'class';

      let inlineStyle = '';

      // <div> -> <div , <input /> -> <input
      startTag = startTag.substring(0, len);

      if (id) startTag += ` id="${id}"`;

      if (isUseClassName && !className) {
        startTag += ` ${clsKey}="${key}"`;
      } else if (className) {
        startTag += ` ${clsKey}="${className}"`;
      }

      if (attributes.length) {
        for (const { name, value } of attributes) {
          if (value === undefined) continue;
          if (value === '') startTag += ` ${name}`;
          else startTag += ` ${name}="${value}"`;
        }
      }

      if (style) {
        // 拖拽节点初始化会加上 {position: 'absolute'}，如果没有其他样式就没必要处理
        if (!isDefaultStyle(Object.keys(style))) {
          restTranslateOfStyle(style.translate, actualPos);
          if (styleType === 'inline') {
            if (sugar === 'react') {
              let styleObj: Record<string, Key> = {};
              for (const key in style) {
                // @ts-ignore
                const val: string | number = style[key];
                if (isInvalidCSSValue(val)) continue;
                styleObj[key] = val;
              }
              startTag += ` style={${JSON.stringify(styleObj)}}`;
            } else {
              for (const key in style) {
                // @ts-ignore
                let val: string | number = style[key];
                if (isInvalidCSSValue(val)) continue;
                if (sugar === 'default') val = normalizeCSSUnit(key, val);
                inlineStyle += `${getKebabCase2(key)}: ${val}; `;
              }
              startTag += ` style="${inlineStyle.trimEnd()}"`;
            }
          }
        }
      }

      startTag += `${selfClose ? ' />' : '>'}`;
      return startTag;
    };

    for (const vnode of dragVnodes) {
      const { type, tag, props, children, content, actualPos, key } = vnode;
      const isSingle = type === NodeType.SINGLE;

      let startTag = isSingle ? `<${tag} />` : `<${tag}>`;
      let endTag = '';

      if (type === NodeType.TEXT) {
        addContent(`${whiteSpace}${content}`);
        addNewline();
        continue;
      }

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
        dfs(children, html, space + indentation);
      }

      endTag = `${children.length ? whiteSpace : ''}</${tag}>`;

      addContent(endTag);
      addNewline();
    }
  };

  dfs(dragVnodes, html, _space);
  return html;
}

function processHTMLOuterStyle(dragVnodes: VNode[], html: string[]) {
  const classList = new Map<string, React.CSSProperties>();

  const addNewline = () => html.push('\n');
  const addContent = (s: string) => html.push(s);

  addContent(`<style>`);
  addNewline();

  const getNodeCls = (perfix: string, nodes: VNode[]) => {
    for (const { children, props, key, type, actualPos } of nodes) {
      if (type === NodeType.TEXT) continue;
      restTranslateOfStyle(props!.style.translate, actualPos);
      const className = props?.className || key;
      const cls = perfix ? `${perfix} > ${className}` : className;
      classList.set(cls, props!.style);
      if (children.length) getNodeCls(cls, children);
    }
  };

  getNodeCls('', dragVnodes);

  for (const [key, value] of classList) {
    if (isDefaultStyle(Object.keys(value))) continue;
    addContent(`  .${key} {`);
    addNewline();
    for (const styleName in value) {
      // @ts-ignore
      let styleVal = value[styleName];
      if (isInvalidCSSValue(styleVal)) continue;
      styleVal = normalizeCSSUnit(styleName, styleVal);
      addContent(`    ${getKebabCase2(styleName)}: ${styleVal};`);
      addNewline();
    }
    addContent(`  }`);
    addNewline();
  }

  addContent('</style>');
  addNewline();
}

function restTranslateOfStyle(obj: CSSProperties['translate'], pos: number[]) {
  const [x, y] = pos;
  if (!x && !y) return;
  obj = `${x}px ${y}px`;
}

function normalizeCSSUnit(key: string, styleVal: string | number) {
  if (typeof styleVal === 'number') {
    if (!propsWithoutUnits.includes(key)) styleVal = `${styleVal}px`;
    return styleVal;
  }
  return styleVal;
}

const isDefaultStyle = (styleKeys: string[]) => {
  return styleKeys.length === 1 && styleKeys[0] === 'position';
};

function isInvalidCSSValue(value: any) {
  if (
    value === undefined ||
    (typeof value === 'string' && (value === '' || value.trim() === ''))
  ) {
    return true;
  }
  if (
    value === 0 ||
    value === '0px' ||
    value === '0%' ||
    value === '0px 0px' ||
    value === '0 0'
  )
    return true;
  return false;
}
