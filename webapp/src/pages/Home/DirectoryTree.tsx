import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Button, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useState } from 'react';
import { CommonTagsSelect } from '../../components';

const { DirectoryTree: Directory } = Tree;

const DirectoryTree: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const handleGetTag = useCallback(
    (tag: string) => {
      handleCloseModal();
      setCurrentTag(tag);
    },
    [handleCloseModal]
  );

  const handleClickTree = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
  }, []);

  const handleRClickTree = useCallback((info: any) => {
    console.log(info);
  }, []);

  return (
    <>
      <CommonTagsSelect open={openModal} onChange={handleGetTag} onCancel={handleCloseModal} />
      <section className='file-list'>
        <section className='file-list-top'>
          <span style={{ fontSize: 12 }}>结构管理器</span>
          {treeData.length > 0 ?? (
            <div>
              <Button type='text' icon={<FileAddOutlined />} />
              <Button type='text' icon={<FolderAddOutlined />} />
            </div>
          )}
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
            {...{ treeData }}
            onSelect={handleClickTree}
            onRightClick={handleRClickTree}
          />
        )}
      </section>
    </>
  );
};

export default DirectoryTree;
