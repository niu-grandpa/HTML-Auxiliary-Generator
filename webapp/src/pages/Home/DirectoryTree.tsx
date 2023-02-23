import { Button, Tree, type TreeDataNode } from 'antd';
import { FC, useCallback, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu } from '../../components/ContextMenu';
import { generate } from '../../core';

const { DirectoryTree: Directory } = Tree;
const { createVNode, vnodeToTreeNode, treeNodeToVNode } = generate();

const DirectoryTree: FC = () => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const handleCreate = useCallback(
    (tagName: string, isLeaf: boolean) => {
      const newData = vnodeToTreeNode(createVNode(tagName), isLeaf);
      setTreeData([...treeData, newData]);
    },
    [treeData]
  );

  const handleClickTree = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
  }, []);

  const handleRTClickTree = useCallback((info: any) => {
    // TODO右键判断该节点isLeaf, true则有新建节点的选项，然后将新节点push进其children
    // TODO 计算位置
    const { event, node } = info;
    treeNodeToVNode();
    setOpenCtxMenu(true);
    setCurIsLeaf(node.isLeaf);
  }, []);

  const handleOptionClick = useCallback(() => {
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
      <ModalCreateNode open={openMdl} onChange={handleCreate} onCancel={handleCloseMdl} />
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
