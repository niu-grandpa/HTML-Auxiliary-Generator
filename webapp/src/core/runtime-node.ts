import { TreeDataNode } from 'antd';

function createIndexMap(source: unknown[]): Map<unknown, number> {
  const map = new Map<unknown, number>();
  for (let i = 0; i < source.length; i++) {
    map.set(source[i], i);
  }
  return map;
}

/**
 * 对结构列表的某个节点单独修改时，需要将其更新回源对象列表中
 * @param root
 * @param node
 * @returns
 */
export function updateAntTree(
  root: TreeDataNode[],
  node: TreeDataNode
): TreeDataNode[] {
  const oldNode = findNode(root, node);
  oldNode && patchNode(oldNode, node);
  return root;
}

function findNode(
  root: TreeDataNode[],
  node: TreeDataNode
): TreeDataNode | undefined {
  let left = 0;
  let right = root.length - 1;
  while (left <= right) {
    const leftNode = root[left++];
    const rightNode = root[right--];
    if (leftNode.key === node.key) {
      return leftNode;
    }
    if (rightNode.key === node.key) {
      return rightNode;
    }
    if (leftNode.children?.length) {
      return findNode(leftNode.children, node);
    }
    if (rightNode.children?.length) {
      return findNode(rightNode.children, node);
    }
  }
  // for (let i = 0; i < root.length; i++) {
  //   const n = root[i];
  //   // 通过 key 找到那个被修改节点在原对象中的原节点
  //   if (n.key === node.key) {
  //     return n;
  //   } else if (n.children?.length) {
  //     return findNode(n.children, node);
  //   }
  // }
}

export function deleteNode(root: TreeDataNode[], node: TreeDataNode) {
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    if (n.key === node.key) {
      root.splice(i, 1);
      break;
    } else if (n.children?.length) {
      deleteNode(n.children, node);
    }
  }
  return root;
}

function patchNode(n1: TreeDataNode, n2: TreeDataNode) {
  // 修改标签名
  if (n1.title !== n2.title) {
    n1.title = n2.title;
  }
  // @ts-ignore
  if (n1.alias !== n2.alias) {
    // @ts-ignore
    n1.alias = n2.alias;
  }
  // @ts-ignore
  if (n1.props !== n2.props) {
    patchProps(n1, n2);
  }
  const oldChildren = n1.children!;
  const newChildren = n2.children!;
  if (oldChildren.length !== newChildren.length) {
    n1.children = patchChildren(oldChildren, newChildren);
  } else {
    // todo
  }
  return n1;
}

// 只存在同一层新增和删除节点的情况
function patchChildren(c1: TreeDataNode[], c2: TreeDataNode[]) {
  const oldLen = c1.length;
  const newLen = c2.length;
  // 1.首次新增节点
  if (!oldLen && newLen) {
    c1 = c2.slice();
    // 2.清空节点
  } else if (oldLen && !newLen) {
    c1.length = 0;
  }
  // 3.追加节点
  else if (oldLen < newLen) {
    c1.push(...c2.slice(oldLen, newLen));
  } // 4.删除节点
  else if (oldLen > newLen) {
    const idxMap = createIndexMap(c1);
    let l = 0;
    let h = oldLen - 1;
    while (l <= h) {
      const leftChild = c1[l++];
      const rightChild = c1[h++];
      if (!c2.includes(leftChild) || !c2.includes(rightChild)) {
        const targetIdx = idxMap.get(leftChild || rightChild)!;
        c1.splice(targetIdx, 1);
        break;
      }
    }
    // for (let i = 0; i < oldLen; i++) {
    //   const oldCh = c1[i];
    //   if (!c2.includes(oldCh)) {
    //     const targetIdx = c1.indexOf(oldCh);
    //     c1.splice(targetIdx, 1);
    //     break;
    //   }
    // }
  }
  return c1;
}

function patchProps(n1: TreeDataNode, n2: TreeDataNode) {
  // @ts-ignore
  const oldProps = n1.props;
  // @ts-ignore
  const newProps = n2.props;
  for (const key in oldProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    oldProps[key] = newValue;
    //  attributes属性 -> [{ name:string, value: string }, ...]
    // if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    //   const oldAttrs = oldValue;
    //   const newAttrs = newValue;
    //   if (!oldAttrs.length && newAttrs.length) {
    //     oldProps[key] = newAttrs;
    //   } else if (oldAttrs.length && !newAttrs.length) {
    //     oldProps[key] = [];
    //   } else {
    //     const indexMap = createIndexMap(oldAttrs);
    // todo
    //   }
    // } else if (oldValue !== newValue) {
    //   oldProps[key] = newValue;
    // }
  }
}
