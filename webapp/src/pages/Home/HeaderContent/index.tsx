import {
  DownloadOutlined,
  FileTextOutlined,
  ReadOutlined,
  SettingOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Drawer,
  Empty,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  message,
} from 'antd';
import { isEqual } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import core from '../../../core';
import { useTreeDataModel } from '../../../model';
import LoginComponent from './Login';

const { buildHTMLString } = core;

const HeaderContent = () => {
  const { dragVnodes } = useTreeDataModel(state => ({
    dragVnodes: state.dragVnodes,
  }));

  const [htmlString, setHTMLString] = useState('');
  const [settings, setSettings] = useState({
    styleType: 'inline',
    sugar: 'default',
  });
  const [openCodeView, setOpenCodeView] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const handleCopy = useCallback(() => {
    if (isEqual(htmlString, '')) return;
    navigator.clipboard.writeText(htmlString).then(() => {
      message.success('复制成功🎉');
    });
  }, [htmlString]);

  const handleCompileHTML = useCallback(() => {
    setOpenCodeView(true);
    setHTMLString(
      buildHTMLString(dragVnodes, {
        space: 0,
        indentation: 2,
        styleType: settings.styleType,
        sugar: settings.sugar,
      })
    );
  }, [dragVnodes, settings]);

  const navItems = useMemo(
    () => [
      { icon: <ReadOutlined />, title: '使用教程', onClick: () => {} },
      {
        icon: <FileTextOutlined />,
        title: '预览代码',
        onClick: handleCompileHTML,
      },
      {
        icon: <SettingOutlined />,
        title: '设置',
        onClick: () => setOpenSettings(true),
      },
      { icon: <DownloadOutlined />, title: '导出', onClick: () => {} },
    ],
    [handleCompileHTML]
  );

  return (
    <>
      <Row className='header-content'>
        <Col span={22}>
          <section className='logo' />
          <Space size='large'>
            {navItems.map(({ icon, title, onClick }) => (
              <Button type='link' ghost {...{ icon, onClick }} key={title}>
                {title}
              </Button>
            ))}
          </Space>
        </Col>
        <Col span={2}>
          <LoginComponent />
        </Col>
      </Row>
      <Drawer
        height={'90%'}
        open={openCodeView}
        destroyOnClose
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
        onClose={() => setOpenCodeView(false)}>
        <pre>
          <code>{isEqual(htmlString, '') ? <Empty /> : htmlString}</code>
        </pre>
      </Drawer>
      <Modal
        open={openSettings}
        title='转换设置'
        footer={false}
        onCancel={() => setOpenSettings(false)}>
        <Space style={{ marginTop: 16, marginBottom: 16 }}>
          <span>转换类型: </span>
          <Select
            size='small'
            allowClear
            defaultValue='default'
            style={{ width: 150 }}
            onChange={v =>
              setSettings(obj => {
                obj.sugar = v;
                return obj;
              })
            }
            options={[
              { label: '原生', value: 'default' },
              { label: 'Vue', value: 'vue' },
              { label: 'React', value: 'react' },
            ]}
          />
          <span>样式语法: </span>
          <Select
            size='small'
            allowClear
            defaultValue='inline'
            style={{ width: 150 }}
            onChange={v =>
              setSettings(obj => {
                obj.styleType = v;
                return obj;
              })
            }
            options={[
              { label: '内联样式', value: 'inline' },
              { label: '类名样式', value: 'classname' },
            ]}
          />
        </Space>
      </Modal>
    </>
  );
};

export default HeaderContent;
