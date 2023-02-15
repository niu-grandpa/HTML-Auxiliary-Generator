import { type VNode } from '.';

/**
 * 生成HTML节点树
 */
export function generate() {
  /**
 * 根节点表
  ```js
  {
    "rootName": [
      { tag: parent, node: [] },
      { tag: parent, node: [] },
      ...
     ]
  }
  ```
 */
  const ROOT_MAP = new Map<string, VNode[]>();

  return (rootName: string, node: VNode[]) => {};
}
