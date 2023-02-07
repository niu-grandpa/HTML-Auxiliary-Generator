import React from 'react';
import { Col, Layout, Menu, Row } from 'antd';
import ViewOperations from './ViewOperations';
import ConfigurationBar from './ConfigurationBar';

import './index.less';

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='dark' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[26, 26]}>
          <Col span={19}>
            <ViewOperations />
          </Col>
          <Col span={5}>
            <ConfigurationBar />
          </Col>
        </Row>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        HTML Development Aids ©{new Date().getFullYear()} Created by Ryan John
      </Footer>
    </Layout>
  );
};

export default Home;
