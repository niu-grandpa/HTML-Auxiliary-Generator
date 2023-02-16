import { Button, Tree, type TreeDataNode } from 'antd';
import { FC, useCallback, useState } from 'react';
import { CommonTagsSelect } from '../../components';
import { generate, VNode } from '../../core';

const { DirectoryTree: Directory } = Tree;
const { createNode } = generate();

const DirectoryTree: FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const transformToTNType = useCallback((node: VNode): TreeDataNode => {
    const { tagName, key } = node;
    return {
      key,
      title: tagName,
    };
  }, []);

  const handleCreateNode = useCallback(
    (res: { name: string; tag: string }) => {
      const { name, tag } = res;
      const data = transformToTNType(createNode(name, tag));
      setTreeData([...treeData, data]);
    },
    [treeData, transformToTNType]
  );

  const handleClickTree = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
  }, []);

  const handleRTClickTree = useCallback((info: any) => {
    console.log(info);
  }, []);

  return (
    <>
      <CommonTagsSelect open={openModal} onChange={handleCreateNode} onCancel={handleCloseModal} />
      <section className='file-list'>
        <section className='file-list-top'>
          <span style={{ fontSize: 12 }}>结构管理器</span>
        </section>
        {!treeData.length ? (
          <>
            <p style={{ marginBottom: 18 }}>尚未新建任何容器。</p>
            <Button type='primary' block onClick={handleOpenModal}>
              新建容器
            </Button>
          </>
        ) : (
          <Directory
            defaultExpandAll
            treeData={treeData}
            onSelect={handleClickTree}
            onRightClick={handleRTClickTree}
          />
        )}
      </section>
    </>
  );
};

export default DirectoryTree;
