import { ProcessTreeDataNode } from './type';

/**
 * Calculate the real coordinates of the node
 *
 * 计算节点脱离画布后在浏览器页面的真实坐标
 */
export function calcRealCoordOfNode(
  wrapper: HTMLElement,
  targetX: number,
  targetY: number
) {
  // x坐标需加上此画布损失的右边距整个浏览器剩余的宽度比值,
  // targetX + [targetX / ((bodyW - wrapperW) / 100))]
  const bodyWidth = document.body.offsetWidth;
  const wrapperWidth = wrapper.offsetWidth;
  // 减去画布宽度后整个页面剩余的宽度百分比
  const remainingWidth = (bodyWidth - wrapperWidth) / 100;
  // 补全拖拽元素在实际页面的左侧距离
  const widthCompletion = ~~(targetX / remainingWidth);
  return [targetX + widthCompletion, targetY];
}

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
  root: ProcessTreeDataNode[],
  node: ProcessTreeDataNode
): ProcessTreeDataNode[] {
  const oldNode = findNode(root, node);
  oldNode && patchNode(oldNode, node);
  return root;
}

export function findNode(
  root: ProcessTreeDataNode[],
  node: ProcessTreeDataNode | string
): ProcessTreeDataNode | undefined {
  const target = typeof node === 'string' ? node : node.key;

  let left = 0;
  let right = root.length - 1;

  while (left <= right) {
    const leftNode = root[left++];
    const rightNode = root[right--];
    if (leftNode.key === target) {
      return leftNode;
    }
    if (rightNode.key === target) {
      return rightNode;
    }
    if (leftNode.children?.length) {
      return findNode(leftNode.children as ProcessTreeDataNode[], node);
    }
    if (rightNode.children?.length) {
      return findNode(rightNode.children as ProcessTreeDataNode[], node);
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

export function deleteNode(
  root: ProcessTreeDataNode[],
  node: ProcessTreeDataNode
) {
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    if (n.key === node.key) {
      root.splice(i, 1);
      break;
    } else if (n.children?.length) {
      deleteNode(n.children as ProcessTreeDataNode[], node);
    }
  }
  return root;
}

function patchNode(n1: ProcessTreeDataNode, n2: ProcessTreeDataNode) {
  // 修改标签名
  n1.title !== n2.title && (n1.title = n2.title);
  n1.alias !== n2.alias && (n1.alias = n2.alias);
  n1.content !== n2.content && (n1.content = n2.content);
  n1.props !== n2.props && patchProps(n1, n2);
  n2.actualPos.forEach((pos, i) => (n1.actualPos[i] = pos));

  const oldChildren = n1.children!;
  const newChildren = n2.children!;
  if (oldChildren.length !== newChildren.length) {
    n1.children = patchChildren(
      oldChildren as ProcessTreeDataNode[],
      newChildren as ProcessTreeDataNode[]
    );
  } else {
    // todo
  }
  return n1;
}

// 只存在同一层新增和删除节点的情况
function patchChildren(c1: ProcessTreeDataNode[], c2: ProcessTreeDataNode[]) {
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

function patchProps(n1: any, n2: any) {
  const oldProps = n1.props;
  const newProps = n2.props;
  for (const key in newProps) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (oldVal === undefined || oldVal !== newVal) {
      oldProps[key] = newVal;
    }
  }
  for (const key in oldProps) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (newVal === undefined && oldVal !== undefined) {
      oldProps[key] = undefined;
    } else if (oldVal !== newVal) {
      oldProps[key] = newVal;
    }
  }
}
