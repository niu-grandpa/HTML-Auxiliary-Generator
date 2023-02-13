import { type TreeNode } from '.';

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
  const ROOT_MAP = new Map<string, TreeNode[]>();

  return (rootName: string, node: TreeNode[]) => {};
}
