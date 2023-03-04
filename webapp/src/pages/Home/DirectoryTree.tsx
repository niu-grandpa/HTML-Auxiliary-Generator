import { BookOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { Button, Modal, Tree, type TreeDataNode } from 'antd';
import { FC, memo, MouseEvent, useCallback, useRef, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu, ItemType } from '../../components/ContextMenu';
import core from '../../core';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';

type Props = {
  onChange: (node: TreeDataNode[]) => void;
};

const { createFileListNode, updateFileListNode } = core;
const { DirectoryTree: Directory } = Tree;
const { confirm } = Modal;

const DirectoryTree: FC<Props> = ({ onChange }) => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [isEditTag, setIsEditTag] = useState(false);
  const [custom, setCustom] = useState<'leaf' | 'not-leaf' | undefined>(undefined);
  const [mdlTitle, setMdlTitle] = useState('新建容器');
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeDataNode>();

  const second = useRef(false);
  const createRoot = useCallback(
    (root: TreeDataNode) => {
      second.current = true;
      root.isLeaf = false;
      return [root];
    },
    [second]
  );

  const createNode = useCallback((tagName: string, isLeaf: boolean) => {
    const node = createFileListNode(tagName, isLeaf);
    node.icon = isLeaf ? <BookOutlined /> : <CodeSandboxOutlined />;
    return node;
  }, []);

  const editTag = useCallback(
    (curNode: TreeDataNode, newTag: string) => {
      curNode.title = newTag;
      setIsEditTag(false);
      const nodes = updateFileListNode(treeData, curNode);
      return nodes;
    },
    [treeData]
  );

  const changeNode = useCallback(
    (node: TreeDataNode, tag: string) => {
      let nodes: TreeDataNode[] = [];
      if (isEditTag && selectedNode?.children?.length) {
        if (SELF_CLOSING_TAG.includes(tag)) {
          confirm({
            title: '警告',
            content: '自闭合元素无法容纳子节点，如果这么做会清空该节点下的所有子节点',
            onOk() {
              selectedNode.children!.length = 0;
              nodes = editTag(selectedNode, tag);
            },
          });
        } else {
          nodes = editTag(selectedNode, tag);
        }
      } else {
        selectedNode!.children?.push(node);
        nodes = updateFileListNode(treeData, selectedNode!);
      }
      setSelectedNode(undefined);
      return nodes;
    },
    [isEditTag, editTag, selectedNode, treeData]
  );

  const handleCreate = useCallback(
    (tagName: string, isLeaf: boolean) => {
      const node = createNode(tagName, isLeaf);
      let nodes: TreeDataNode[] = [];
      if (!second.current && !treeData.length) {
        nodes = createRoot(node);
      } else if (second.current && selectedNode) {
        nodes = changeNode(node, tagName);
      }
      onChange(nodes);
      setTreeData(nodes);
    },
    [treeData, selectedNode, onChange, createRoot, createNode, changeNode]
  );

  const deleteNode = useCallback(() => {
    const nodes = updateFileListNode(treeData, { key: selectedNode!.key });
    setTreeData(nodes);
  }, [treeData, selectedNode]);

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

  const handleOptionClick = useCallback(
    (value: ItemType) => {
      const isLf = value === 'leaf';
      const isNotLf = value === 'not-leaf';
      if (isLf || isNotLf) {
        setCustom(value);
        setOpenModal(true);
        setMdlTitle(`新建${isLf ? '单' : '容器'}节点`);
      } else if (value === 'change-tag') {
        setOpenModal(true);
        setIsEditTag(true);
      } else if (value === 'delete-node') {
        deleteNode();
      } else if (value === 'setting-css') {
        // todo
      }
      setOpenCtxMenu(false);
    },
    [deleteNode]
  );

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
        onChange={handleCreate}
        onCancel={handleCloseMdl}
      />
      <section className='file-list' onContextMenu={e => e.preventDefault()}>
        <section className='file-list-top'>
          <span style={{ padding: '8px 0', fontSize: 12 }}>结构管理(工作区)</span>
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
