import { SnippetsOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Empty, Row, Tooltip, message } from 'antd';
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
      <Row>
        <Col span={22}>
          <section className='logo' />
          <Button type='primary' ghost onClick={handleCompileHTML}>
            代码预览
          </Button>
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
