import { SnippetsOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Drawer,
  Empty,
  Menu,
  MenuProps,
  Row,
  Tooltip,
  message,
} from 'antd';
import { memo, useCallback, useRef, useState } from 'react';
import core from '../../../core';
import { useTreeDataModel } from '../../../model';

const { buildHTMLString } = core;

const HeaderContent = memo(() => {
  const { dragVnodes } = useTreeDataModel(state => ({
    dragVnodes: state.dragVnodes,
  }));

  const htmlString = useRef('');
  const [open, setOpen] = useState(false);
  const [menuKey, setMenuKey] = useState('');

  const handleCopy = useCallback(() => {
    if (!htmlString.current) return;
    navigator.clipboard.writeText(htmlString.current).then(() => {
      message.success('复制成功🎉');
    });
  }, []);

  const handleCompileHTML = useCallback(() => {
    htmlString.current = buildHTMLString(dragVnodes);
  }, [dragVnodes]);

  const menuItems: MenuProps['items'] = [
    {
      label: '代码操作',
      key: 'caode',
      children: [
        {
          label: '查看',
          key: 'review',
          onClick: () => setOpen(true),
        },
        {
          label: '复制',
          key: 'copy',
          onClick: handleCopy,
        },
      ],
    },
    {
      label: '登录',
      key: 'login',
    },
  ];

  return (
    <>
      <Row>
        <Col span={21}>
          <section className='logo' />
        </Col>
        <Col span={3}>
          <Menu
            mode='horizontal'
            items={menuItems}
            theme='dark'
            selectedKeys={[menuKey]}
            onClick={e => setMenuKey(e.key)}
            onOpenChange={handleCompileHTML}
          />
        </Col>
      </Row>
      <Drawer
        width={520}
        {...{ open }}
        mask={false}
        title='HTML源代码'
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
          <code>{!htmlString.current ? <Empty /> : htmlString.current}</code>
        </pre>
      </Drawer>
    </>
  );
});

export default HeaderContent;
