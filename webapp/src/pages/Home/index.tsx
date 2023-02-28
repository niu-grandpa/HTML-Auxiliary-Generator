import { Col, Layout, Menu, Row, TreeDataNode } from 'antd';
import React, { useEffect, useState } from 'react';
import core from '../../core';
import { type VNode } from '../../core/runtime-transform';
import DirectoryTree from './DirectoryTree';
import './index.less';
import ViewOperations from './ViewOperations';

const { treeNodeToVNode } = core;
const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [vnode, setVnode] = useState<VNode[]>([]);
  const [fileListNode, setFileListNode] = useState<TreeDataNode[]>([]);

  useEffect(() => {
    if (fileListNode.length) {
      setVnode(treeNodeToVNode(fileListNode));
    }
  }, [fileListNode]);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='light' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[19, 19]}>
          <Col span={5}>
            <DirectoryTree onChange={setFileListNode} />
          </Col>
          <Col span={19}>
            <ViewOperations {...{ vnode }} />
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
