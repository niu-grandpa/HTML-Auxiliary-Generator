import { Col, Layout, Row } from 'antd';
import React, { useEffect } from 'react';
import DirectoryTree from './DirectoryTree';
import ViewOperations from './ViewOperations';

import HeaderContent from './HeaderContent';
import './index.less';

const { Header, Content } = Layout;

const Home: React.FC = () => {
  useEffect(() => {
    document.title = '开发管理页 - HTML Auxiliary Generator';
  }, []);

  return (
    <Layout className='layout'>
      <Header>
        <HeaderContent />
      </Header>
      <Content>
        <Row>
          <Col span={19} className='grid-background'>
            <ViewOperations />
          </Col>
          <Col span={5}>
            <DirectoryTree fieldNames={{ title: 'alias' }} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Home;
