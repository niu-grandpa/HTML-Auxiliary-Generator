import { BookOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { Button, Modal, Tree, type TreeDataNode } from 'antd';
import { FC, memo, MouseEvent, useCallback, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu, ItemType } from '../../components/ContextMenu';
import core from '../../core';
import { SELF_CLOSING_TAG } from '../../core/transform';

type Props = {
  onChange: (node: TreeDataNode[]) => void;
};

const { createVNode, vnodeToTreeNode, updateFileListNode } = core;
const { DirectoryTree: Directory } = Tree;
const { confirm } = Modal;

const DirectoryTree: FC<Props> = ({ onChange }) => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [isChangeTag, setIsChangeTag] = useState(false);
  const [custom, setCustom] = useState<'leaf' | 'not-leaf' | undefined>(undefined);
  const [mdlTitle, setMdlTitle] = useState('新建容器');
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeDataNode>();

  const handleChangeTag = useCallback(
    (curNode: TreeDataNode, newTag: string) => {
      curNode.title = newTag;
      setIsChangeTag(false);
      const node = updateFileListNode(treeData, curNode);
      return node;
    },
    [treeData]
  );

  const handleCRUDNode = useCallback(
    (tagName: string, isLeaf: boolean) => {
      const newNode = vnodeToTreeNode<TreeDataNode>(createVNode(tagName), isLeaf);
      newNode.icon = isLeaf ? <BookOutlined /> : <CodeSandboxOutlined />;
      let node: TreeDataNode[] = [];
      // 通过右键增删节点
      if (selectedNode) {
        if (isChangeTag && selectedNode.children?.length) {
          if (SELF_CLOSING_TAG.includes(tagName)) {
            confirm({
              title: '警告',
              content: '自闭合标签无法容纳子节点，如果执意这么做则会清空当前节点下所有子元素',
              onOk() {
                selectedNode.children!.length = 0;
                node = handleChangeTag(selectedNode, tagName);
              },
            });
          } else {
            node = handleChangeTag(selectedNode, tagName);
          }
        } else {
          selectedNode.children?.push(newNode);
          node = updateFileListNode(treeData, selectedNode);
        }
        setSelectedNode(undefined);
      } else {
        node = treeData.slice().concat(newNode);
      }
      onChange(node);
      setTreeData(node);
    },
    [treeData, selectedNode, onChange, isChangeTag, handleChangeTag]
  );

  const handleClickTree = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
  }, []);

  const handleRTClickTree = useCallback((info: any) => {
    const { event, node } = info;
    const { clientX, clientY } = event as MouseEvent;
    setSelectedNode(node);
    setOpenCtxMenu(true);
    setCurIsLeaf(node.isLeaf);
    setCtxMenuPosi({ x: clientX, y: clientY + 10 });
  }, []);

  const handleOptionClick = useCallback((value: ItemType) => {
    const isLf = value === 'leaf';
    const isNotLf = value === 'not-leaf';
    if (isLf || isNotLf) {
      setCustom(value);
      setOpenModal(true);
      setMdlTitle(`新建${isLf ? '单' : '容器'}节点`);
    } else if (value === 'change-tag') {
      setOpenModal(true);
      setIsChangeTag(true);
    } else if (value === 'delete-node') {
      // todo
    } else if (value === 'setting-css') {
      // todo
    }
    setOpenCtxMenu(false);
  }, []);

  const handleOpenMdl = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseMdl = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <>
      <ModalCreateNode
        title={mdlTitle}
        custom={custom}
        open={openMdl}
        onChange={handleCRUDNode}
        onCancel={handleCloseMdl}
      />
      <section className='file-list' onContextMenu={e => e.preventDefault()}>
        <section className='file-list-top'>
          <span style={{ padding: '8px 0', fontSize: 12 }}>结构管理器</span>
        </section>
        {!treeData.length ? (
          <>
            <p style={{ marginBottom: 18 }}>尚未新建任何容器。</p>
            <Button type='primary' block onClick={handleOpenMdl}>
              新建容器
            </Button>
          </>
        ) : (
          <>
            <Directory
              defaultExpandAll
              showLine
              treeData={treeData}
              onSelect={handleClickTree}
              onRightClick={handleRTClickTree}
            />
            <ContextMenu
              {...{ ...ctxMenuPosi }}
              open={openCtxMenu}
              isLeaf={curIsLeaf}
              onClick={handleOptionClick}
            />
          </>
        )}
      </section>
    </>
  );
};

export default memo(DirectoryTree);
