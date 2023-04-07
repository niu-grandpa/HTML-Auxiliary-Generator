import { Button, Col, Layout, Row } from 'antd';
import React, { useCallback, useEffect } from 'react';
import DirectoryTree from './DirectoryTree';
import ViewOperations from './ViewOperations';

import { useTreeDataModel } from '../../model';
import './index.less';

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const { treeData } = useTreeDataModel(state => ({
    treeData: state.treeData,
  }));

  useEffect(() => {
    document.title = '开发管理页 - HTML Auxiliary Generator';
  }, []);

  const handleCompileHTML = useCallback(() => {
    console.log(treeData);
  }, [treeData]);

  return (
    <Layout className='layout'>
      <Header>
        <section className='logo' />
        <Button onClick={handleCompileHTML}>导出</Button>
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
      <Footer style={{ textAlign: 'center' }}>
        HTML Auxiliary Generator ©{new Date().getFullYear()} Created by Ryan
        John
      </Footer>
    </Layout>
  );
};

export default Home;
