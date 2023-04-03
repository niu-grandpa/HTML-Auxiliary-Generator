import { Col, Layout, Row, TreeDataNode } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import core from '../../core';
import { type VNode } from '../../core/utils';
import DirectoryTree from './DirectoryTree';
import ViewOperations from './ViewOperations';
import './index.less';

const { antTreeNodeToVNode } = core;
const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [vnodes, setVnodes] = useState<VNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');

  useEffect(() => {
    document.title = '开发管理页 - HTML Auxiliary Generator';
  }, []);

  const handleTreeDataChange = useCallback((data: TreeDataNode[]) => {
    setVnodes(antTreeNodeToVNode(data));
  }, []);

  const handleDragNodeClick = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
      </Header>
      <Content style={{ padding: '18px 20px 18px 26px' }}>
        <Row gutter={[24, 24]}>
          <Col span={18} className='grid-background'>
            <ViewOperations {...{ vnodes }} onItemClick={handleDragNodeClick} />
          </Col>
          <Col span={6}>
            <DirectoryTree
              {...{ selectedKey }}
              onChange={handleTreeDataChange}
              fieldNames={{ title: 'alias' }}
            />
          </Col>
        </Row>
      </Content>
      {/* <Footer style={{ textAlign: 'center' }}>
        HTML Auxiliary Generator ©{new Date().getFullYear()} Created by Ryan
        John
      </Footer> */}
    </Layout>
  );
};

export default Home;
