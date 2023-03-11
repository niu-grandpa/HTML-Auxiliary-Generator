import { type TreeDataNode } from 'antd';
import { VNode } from './runtime-transform';
import { createRootKey } from './utils';

const generate = _generate_();
export default generate;

function _generate_() {
  // { key: VNode, ... }
  const map = new Map<number, TreeDataNode[]>();
  const getKey = createRootKey();

  /**
   * 创建antd tree节点
   * @param tag
   * @param isLeaf
   * @returns
   */
  function createAntTreeNode(tag: string, isLeaf: boolean): TreeDataNode {
    return {
      key: getKey(),
      isLeaf,
      title: tag,
      children: [],
    };
  }

  /**
   * antd Tree节点转换为vnode
   * @param root
   */
  function antTreeNodeToVNode(root: TreeDataNode[]) {
    const h = (type: string, props: VNode['props'], children: VNode[]) => {
      return {
        type,
        props,
        children,
      };
    };
    const dfs = () => {
      for (let i = 0; i < root.length; i++) {
        const node = root[i];
      }
    };
  }

  /**
   * 根据vnode树构建html字符串
   */
  function buildHTMLString(): string {
    return '';
  }

  return {
    antTreeNodeToVNode,
    createAntTreeNode,
    buildHTMLString,
  };
}
