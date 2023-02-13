import { FileAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Button, Tree } from 'antd';
import type { DataNode, DirectoryTreeProps } from 'antd/es/tree';
import React from 'react';

const { DirectoryTree: Directory } = Tree;

const treeData: DataNode[] = [
  {
    title: 'parent 0',
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
    ],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
    ],
  },
];

const DirectoryTree: React.FC = () => {
  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };

  return (
    <section className='file-list'>
      <section className='file-list-top'>
        <span>结构目录</span>
        <div>
          <Button type='text' icon={<FileAddOutlined />} />
          <Button type='text' icon={<FolderAddOutlined />} />
        </div>
      </section>
      <Directory
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
      />
    </section>
  );
};

export default DirectoryTree;
