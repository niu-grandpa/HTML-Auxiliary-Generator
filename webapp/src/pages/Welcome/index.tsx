import { Button, Col, Layout, Row, Space } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainIcon from '../../assets/images/main.svg';

import { GithubOutlined } from '@ant-design/icons';
import './index.less';

const { Content, Footer } = Layout;

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '介绍 - HTML Auxiliary Generator';
  }, []);

  return (
    <Layout className='wec-main'>
      <Content>
        <figure className='wec-figure'>
          <Row style={{ marginTop: 84 }}>
            <Col span={12} className='wec-title'>
              <h1 className='wec-title-title'>HTML Auxiliary Generator</h1>
              <p className='wec-title-desc'>
                辅助开发者通过「可视化」操作，「更简单」「更省时」地制作出静态网页或组件！
              </p>
              <p className='wec-title-desc' style={{ textAlign: 'right' }}>
                —— 让用户从手敲 HTML 和 CSS 的枯燥乏味中脱离出来 ~
              </p>
            </Col>
            <Col>
              <img src={MainIcon} className='wec-bgi' alt='bg' />
            </Col>
          </Row>
        </figure>
        <Space className='wec-btn-group'>
          <Button
            type='primary'
            size='large'
            shape='round'
            className='wec-start-btn'
            onClick={() => navigate('/home')}>
            开始使用
          </Button>
          <Button
            size='large'
            shape='round'
            className='wec-start-btn'
            onClick={() => navigate('/tutorial')}>
            使用教程
          </Button>
        </Space>
      </Content>
      <Footer className='wec-footer'>
        <p style={{ opacity: 0.4 }}>
          <a
            className='wec-footer-ico'
            target='_blank'
            href='https://github.com/niu-grandpa/HTML-Auxiliary-Generator/tree/master/webapp'
            rel='noreferrer'>
            <GithubOutlined />
          </a>
          Made with ❤ by Ryan John
        </p>
        <p style={{ marginTop: 6 }}>热爱开源追求自由的 Github 牛爷爷</p>
      </Footer>
    </Layout>
  );
};

export default Home;
