import { Button, Tree, type TreeDataNode } from 'antd';
import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu, ItemType } from '../../components/ContextMenu';
import { generate } from '../../core';

const { DirectoryTree: Directory } = Tree;
const { createVNode, vnodeToTreeNode, treeNodeToVNode, updateNode } = generate();

const DirectoryTree: FC = () => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [custom, setCustom] = useState<'leaf' | 'not-leaf' | undefined>(undefined);
  const [mdlTitle, setMdlTitle] = useState('新建容器');
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeDataNode>();

  const handleCreate = useCallback(
    (tagName: string, isLeaf: boolean) => {
      const newNode = vnodeToTreeNode(createVNode(tagName), isLeaf);
      // 通过右键节点新增
      if (selectedNode !== undefined) {
        selectedNode.children?.push(newNode);
        const data = updateNode(treeData, selectedNode);
        setTreeData(data);
      } else {
        setTreeData([...treeData, newNode]);
      }
    },
    [treeData, selectedNode]
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
      setOpenModal(true);
      setCustom(value);
      setMdlTitle(`新建${isLf ? '单' : '容器'}节点`);
    }
    setOpenCtxMenu(false);
  }, []);

  const handleOpenMdl = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseMdl = useCallback(() => {
    setOpenModal(false);
  }, []);

  useEffect(() => {
    treeNodeToVNode();
  }, [selectedNode]);

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

export default DirectoryTree;
