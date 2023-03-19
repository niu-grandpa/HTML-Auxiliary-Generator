import { Col, Layout, Menu, Row, TreeDataNode } from 'antd';
import React, { useEffect, useState } from 'react';
import core from '../../core';
import { type VNode } from '../../core/utils';
import DirectoryTree from './DirectoryTree';
import './index.less';
import ViewOperations from './ViewOperations';

const { antTreeNodeToVNode } = core;
const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [vnodes, setVnodes] = useState<VNode[]>([]);
  const [antTreeData, setAntTreeData] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    if (antTreeData.length) {
      setVnodes(antTreeNodeToVNode(antTreeData));
    }
  }, [antTreeData]);

  useEffect(() => {
    document.title = '开发管理页 - HTML Auxiliary Generator';
  }, []);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='light' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[19, 19]}>
          <Col span={6}>
            <DirectoryTree
              selectedKey={0}
              onChange={setAntTreeData}
              fieldNames={{ title: 'alias' }}
            />
          </Col>
          <Col span={18}>
            <ViewOperations {...{ vnodes }} />
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        HTML Auxiliary Generator ©{new Date().getFullYear()} Created by Ryan John
      </Footer>
    </Layout>
  );
};

export default Home;
