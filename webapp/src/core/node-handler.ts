import { TreeDataNode } from 'antd';

/**
 * 对结构列表的某个节点单独修改时，需要将其更新回源对象列表中
 * @param source
 * @param node
 * @returns
 */
export function updateFileListNode<T extends TreeDataNode>(source: T[], node: T): T[] {
  const oldNode = findNode(source, node);
  patchNode(oldNode, node);
  return source;
}

function findNode(source: any[], node: any) {
  for (let i = 0; i < source.length; i++) {
    const n = source[i];
    // 通过 key 找到那个被修改节点在原对象中的原节点
    if (n?.key === node?.key) {
      return n;
    } else if (n?.children?.length) {
      findNode(n.children, node);
    }
  }
}

function patchNode(n1: any, n2: any) {
  if (n1.tag !== n2.tag) {
    n1.tag = n2.tag;
  }
  const oldChildren = n1.children;
  const newChildren = n2.children;
  patchChildren(oldChildren, newChildren);
}

function patchChildren(c1: any[], c2: any[]) {
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
  else {
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
