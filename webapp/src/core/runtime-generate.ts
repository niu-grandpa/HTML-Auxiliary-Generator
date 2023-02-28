import { type TreeDataNode } from 'antd';
import { VNode } from './runtime-transform';

const generate = _generate_();
export default generate;
/**
 * 生成VNode树
 */
function _generate_() {
  // { key: VNode, ... }
  const map = new Map<number, TreeDataNode[]>();

  function createMapRecored(key: number, fileListRoot: TreeDataNode[]) {
    map.set(key, fileListRoot);
  }

  function getMapRecored() {
    return map;
  }

  /**
   * 创建vnode节点
   * @param tagName 标签名
   * @returns {VNode}
   */
  function createVNode(tagName: string, key: number): VNode {
    const node: VNode = {
      key,
      tagName,
      props: {},
      children: [],
    };
    return node;
  }

  /**
   * 创建tree文件列表节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createFileListNode(tag: string, rootKey: number, isLeaf: boolean) {
    return vnodeToTreeNode(createVNode(tag, rootKey), isLeaf);
  }

  /**
   * 转换为antd Tree组件所需数据的结构
   * @param {VNode} node
   * @param {boolean} isLeaf 是否为叶子节点
   * @returns {TreeDataNode}
   */
  function vnodeToTreeNode(node: VNode, isLeaf: boolean): TreeDataNode {
    const { tagName, key } = node;
    return {
      key,
      isLeaf,
      title: tagName,
      children: [],
    };
  }

  /**
   * antd Tree节点转换为vnode
   * @param node
   */
  function treeNodeToVNode(node: TreeDataNode[]): VNode[] {
    return [];
  }

  return {
    createMapRecored,
    createVNode,
    vnodeToTreeNode,
    treeNodeToVNode,
    createFileListNode,
    getMapRecored,
  };
}
