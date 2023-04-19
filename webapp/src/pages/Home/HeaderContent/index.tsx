import {
  DownloadOutlined,
  FileTextOutlined,
  ReadOutlined,
  SettingOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import { Button, Col, Drawer, Empty, Row, Space, Tooltip, message } from 'antd';
import { isEqual } from 'lodash';
import { useCallback, useState } from 'react';
import core from '../../../core';
import { useTreeDataModel } from '../../../model';
import Login from './Login';

const { buildHTMLString } = core;

const HeaderContent = () => {
  const { dragVnodes } = useTreeDataModel(state => ({
    dragVnodes: state.dragVnodes,
  }));

  const [open, setOpen] = useState(false);
  const [htmlString, setHTMLString] = useState('');

  const handleCopy = useCallback(() => {
    if (isEqual(htmlString, '')) return;
    navigator.clipboard.writeText(htmlString).then(() => {
      message.success('复制成功🎉');
    });
  }, [htmlString]);

  const handleCompileHTML = useCallback(() => {
    setOpen(true);
    setHTMLString(buildHTMLString(dragVnodes));
  }, [dragVnodes]);

  return (
    <>
      <Row className='header-content'>
        <Col span={22}>
          <section className='logo' />
          <Space size='large'>
            <Button
              type='link'
              icon={<ReadOutlined />}
              ghost
              onClick={handleCompileHTML}>
              使用教程
            </Button>
            <Button
              type='link'
              icon={<FileTextOutlined />}
              ghost
              onClick={handleCompileHTML}>
              预览代码
            </Button>
            <Button
              type='link'
              icon={<SettingOutlined />}
              ghost
              onClick={handleCompileHTML}>
              设置
            </Button>
            <Button
              type='link'
              icon={<DownloadOutlined />}
              ghost
              onClick={handleCompileHTML}>
              导出
            </Button>
          </Space>
        </Col>
        <Col span={2}>
          <Login />
        </Col>
      </Row>
      <Drawer
        height={600}
        {...{ open }}
        title='HTML代码预览'
        placement='bottom'
        extra={
          <Tooltip title='复制代码'>
            <Button
              shape='circle'
              icon={<SnippetsOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>
        }
        onClose={() => setOpen(false)}>
        <pre>
          <code>{isEqual(htmlString, '') ? <Empty /> : htmlString}</code>
        </pre>
      </Drawer>
    </>
  );
};

export default HeaderContent;
