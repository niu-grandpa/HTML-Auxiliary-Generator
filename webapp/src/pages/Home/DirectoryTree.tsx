import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Button, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useState } from 'react';

const { DirectoryTree: Directory } = Tree;

const DirectoryTree: React.FC = () => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  const onAddTemplate = useCallback(() => {}, []);

  const onSelect = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
  }, []);

  const onRightClick = useCallback((info: any) => {
    console.log(info);
  }, []);

  return (
    <section className='file-list'>
      <section className='file-list-top'>
        <span style={{ fontSize: 12 }}>结构管理器</span>
        {treeData.length ? (
          <div>
            <Button type='text' icon={<FileAddOutlined />} />
            <Button type='text' icon={<FolderAddOutlined />} />
          </div>
        ) : null}
      </section>
      {!treeData.length ? (
        <>
          <p style={{ marginBottom: 18 }}>尚未新建任何元素。</p>
          <Button type='primary' block onClick={onAddTemplate}>
            新建元素
          </Button>
        </>
      ) : (
        <Directory defaultExpandAll {...{ onSelect, onRightClick, treeData }} />
      )}
    </section>
  );
};

export default DirectoryTree;
