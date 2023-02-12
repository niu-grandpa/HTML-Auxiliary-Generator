import { Col, Layout, Menu, Row } from 'antd';
import React from 'react';
import ViewOperations from './ViewOperations';

import DirectoryTree from './DirectoryTree';
import './index.less';

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='light' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[19, 19]}>
          <Col span={5}>
            <DirectoryTree />
          </Col>
          <Col span={19}>
            <ViewOperations />
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
