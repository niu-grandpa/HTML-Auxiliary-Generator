import { TreeDataNode } from 'antd';

/**
 * 对结构列表的某个节点单独修改时，需要将其更新回源对象列表中
 * @param root
 * @param node
 * @returns
 */
export function updateAntTree<T extends TreeDataNode>(root: T[], node: T): T[] {
  const oldNode = findNode(root, node);
  oldNode && patchNode(oldNode, node);
  return root;
}

function findNode(root: TreeDataNode[], node: TreeDataNode): TreeDataNode | undefined {
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    // 通过 key 找到那个被修改节点在原对象中的原节点
    if (n.key === node.key) {
      return n;
    } else if (n.children?.length) {
      findNode(n.children, node);
    }
  }
  return undefined;
}

export function deleteNode(root: TreeDataNode[], node: TreeDataNode) {
  for (let i = 0; i < root.length; i++) {
    const n = root[i];
    if (n.key === node.key) {
      // delete root[i];
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
  const oldChildren = n1.children!;
  const newChildren = n2.children!;
  if (oldChildren.length !== newChildren.length) {
    patchChildren(oldChildren, newChildren);
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
    c1.push(c2[newLen - 1]);
  } // 4.删除节点
  else if (oldLen > newLen) {
    for (let i = 0; i < oldLen; i++) {
      const oldCh = c1[i];
      if (!c2.includes(oldCh)) {
        const targetIdx = c1.indexOf(oldCh);
        c1.splice(targetIdx, 1);
        break;
      }
    }
  }
}

function patchProps() {}
