export type Root = Map<string, NodeObject[]>;

export type NodeObject = {
  tag: string;
  on?: Record<string, Function>;
  attributes?: Record<string, any>;
  children: Array<string | NodeObject>;
};

/**转换节点对象为HTML字符串模板 */
export const transformToHTMLString = (root: NodeObject) => {
  let template = '';

  const transform = (root: NodeObject) => {
    const { tag, children } = root;
    template += `<${tag}>\n`;
    for (const child of children) {
      if (typeof child === 'string') {
        template += child;
        continue;
      }
      transform(child);
    }
    template += `\n</${tag}>`;
  };

  transform(root);
  return template;
};
