import { Col, Layout, Menu, Row, TreeDataNode } from 'antd';
import React, { useCallback, useState } from 'react';
import ViewOperations from './ViewOperations';

import DirectoryTree from './DirectoryTree';
import './index.less';

const { Header, Content, Footer } = Layout;

const Home: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const handleChangeTree = useCallback((data: TreeDataNode[]) => {
    setTreeData(data);
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
            <DirectoryTree onChange={handleChangeTree} />
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
