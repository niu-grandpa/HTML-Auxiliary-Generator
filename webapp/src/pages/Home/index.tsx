import { Col, Layout, Menu, Row, TreeDataNode } from 'antd';
import React, { useEffect, useState } from 'react';
import core from '../../core';
import { type VNode } from '../../core/utils';
import ConfigurationBar from './ConfigurationBar';
import DirectoryTree from './DirectoryTree';
import './index.less';
import ViewOperations from './ViewOperations';

const { antTreeNodeToVNode, createPlaceholder } = core;
const { Header, Content, Footer } = Layout;

const { mountedDragPlaceholder, setDragPlaceholder } = createPlaceholder();

const Home: React.FC = () => {
  const [vnodes, setVnodes] = useState<VNode[]>([]);
  const [antTreeData, setAntTreeData] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    if (antTreeData.length) {
      setVnodes(antTreeNodeToVNode(antTreeData));
    }
  }, [antTreeData]);

  useEffect(() => {
    mountedDragPlaceholder();
  }, []);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='light' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[19, 19]}>
          <Col span={5}>
            <DirectoryTree onChange={setAntTreeData} />
          </Col>
          <Col span={19}>
            <ViewOperations {...{ vnodes }} />
          </Col>
        </Row>
        <ConfigurationBar />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        HTML Auxiliary Generator ©{new Date().getFullYear()} Created by Ryan John
      </Footer>
    </Layout>
  );
};

export default Home;
