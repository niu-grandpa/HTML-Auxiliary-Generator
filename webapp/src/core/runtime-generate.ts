import { type TreeDataNode } from 'antd';
import { createRootKey } from './utils';

const generate = _generate_();
export default generate;
/**
 * 生成VNode树
 */
function _generate_() {
  // { key: VNode, ... }
  const map = new Map<number, TreeDataNode[]>();
  const getKey = createRootKey();

  /**
   * 创建tree文件列表节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createFileListNode(tag: string, isLeaf: boolean): TreeDataNode {
    return {
      key: getKey(),
      isLeaf,
      title: tag,
      children: [],
    };
  }

  /**
   * antd Tree节点转换为vnode
   * @param node
   */
  function filListNodeToVNode(node: TreeDataNode[]) {
    // todo
  }

  /**
   * 根据vnode树构建html字符串
   */
  function buildHTMLString(): string {
    return '';
  }

  return {
    filListNodeToVNode,
    createFileListNode,
    buildHTMLString,
  };
}
