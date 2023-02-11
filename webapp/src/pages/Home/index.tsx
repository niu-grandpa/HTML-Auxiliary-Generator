import { Col, Layout, Menu, Row } from 'antd';
import React, { useCallback, useEffect } from 'react';
import ConfigurationBar from './ConfigurationBar';
import ViewOperations from './ViewOperations';

import './index.less';

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const stopCtxMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);
  useEffect(() => {
    window.addEventListener('contextmenu', stopCtxMenu);
    return () => {
      window.removeEventListener('contextmenu', stopCtxMenu);
    };
  }, [stopCtxMenu]);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Menu theme='dark' mode='horizontal' defaultSelectedKeys={['']} items={[]} />
      </Header>
      <Content style={{ padding: '18px 38px 0 38px' }}>
        <Row gutter={[24, 24]}>
          <Col span={19}>
            <ViewOperations />
          </Col>
          <Col span={5}>
            <ConfigurationBar />
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
