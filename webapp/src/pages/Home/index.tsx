import { Col, Layout, Row, TreeDataNode } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import core from '../../core';
import { type VNode } from '../../core/utils';
import DirectoryTree from './DirectoryTree';
import './index.less';
import ViewOperations from './ViewOperations';

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
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[19, 19]}>
          <Col span={6}>
            <DirectoryTree
              {...{ selectedKey }}
              onChange={handleTreeDataChange}
              fieldNames={{ title: 'alias' }}
            />
          </Col>
          <Col span={18}>
            <ViewOperations {...{ vnodes }} onItemClick={handleDragNodeClick} />
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        HTML Auxiliary Generator ©{new Date().getFullYear()} Created by Ryan
        John
      </Footer>
    </Layout>
  );
};

export default Home;
