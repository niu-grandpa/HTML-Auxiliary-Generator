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
  Input,
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

const { buildHTMLString, processWhenHTMLExport } = core;

const HeaderContent = () => {
  const { dragVnodes } = useTreeDataModel(state => ({
    dragVnodes: state.dragVnodes,
  }));

  const [htmlString, setHTMLString] = useState('');
  const [settings, setSettings] = useState({
    file: 'html',
    sugar: 'default',
    styleType: 'inline',
    name: `Component_${Date.now()}`,
  });
  const [openCodeView, setOpenCodeView] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const handleCopy = useCallback(() => {
    if (isEqual(htmlString, '')) return;
    navigator.clipboard.writeText(htmlString).then(() => {
      message.success('复制成功🎉');
    });
  }, [htmlString]);

  const onComplie = useCallback(
    (sugar = settings.sugar, styleType = settings.styleType) => {
      const res = buildHTMLString(dragVnodes, {
        space: 1,
        indentation: 2,
        styleType,
        sugar,
      });
      setHTMLString(res.join(''));
      return res;
    },
    [dragVnodes, settings]
  );

  const handleCompileHTML = useCallback(() => {
    onComplie();
    setOpenCodeView(true);
  }, [onComplie]);

  const handleSettings = useCallback((name: string, val: string) => {
    setSettings(obj => {
      // @ts-ignore
      obj[name] = val;
      return obj;
    });
  }, []);

  const handleExport = useCallback(() => {
    const sugar = settings.sugar;
    const res = processWhenHTMLExport(
      sugar,
      settings.name,
      onComplie(sugar, sugar === 'react' ? 'inline' : settings.styleType)
    );
    // todo 传给后端接口
  }, [onComplie, settings]);

  const navItems = useMemo(
    () => [
      { icon: <ReadOutlined />, title: '使用教程', onClick: () => {} },
      {
        icon: <FileTextOutlined />,
        title: '查看代码',
        onClick: handleCompileHTML,
      },
      {
        icon: <SettingOutlined />,
        title: '设置',
        onClick: () => setOpenSettings(true),
      },
      { icon: <DownloadOutlined />, title: '导出', onClick: handleExport },
    ],
    [handleCompileHTML, handleExport]
  );

  return (
    <>
      <Row className='header-content'>
        <Col span={22}>
          <section className='logo' />
          <Space size='large'>
            {navItems.map(({ icon, title, onClick }) => (
              <Button type='link' {...{ icon, onClick }} key={title}>
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
        title={
          <>
            <span style={{ marginRight: 12 }}>HTML代码预览</span>
            <Tooltip title='复制代码'>
              <SnippetsOutlined
                onClick={handleCopy}
                style={{ fontSize: 18, cursor: 'pointer' }}
              />
            </Tooltip>
          </>
        }
        placement='bottom'
        onClose={() => setOpenCodeView(false)}>
        <pre>
          <code>{isEqual(htmlString, '') ? <Empty /> : htmlString}</code>
        </pre>
      </Drawer>
      <Modal
        open={openSettings}
        title='功能设置'
        footer={false}
        onCancel={() => setOpenSettings(false)}>
        <Space style={{ marginTop: 16, marginBottom: 16 }} size='large' wrap>
          <span>框架语法: </span>
          <Select
            size='small'
            defaultValue='default'
            style={{ width: 130 }}
            onChange={v => handleSettings('sugar', v)}
            options={[
              { label: '原生', value: 'default' },
              { label: 'Vue', value: 'vue' },
              { label: 'React', value: 'react' },
            ]}
          />
          <span>样式语法: </span>
          <Select
            size='small'
            defaultValue='inline'
            style={{ width: 130 }}
            onChange={v => handleSettings('styleType', v)}
            options={[
              { label: '内联', value: 'inline' },
              { label: '类名', value: 'classname' },
            ]}
          />
          <span>导出命名: </span>
          <Input size='small' style={{ width: 130 }} />
          <span>导出后缀: </span>
          <Select
            size='small'
            defaultValue='html'
            style={{ width: 130 }}
            onChange={v => handleSettings('file', v)}
            options={[
              { label: '*.html', value: 'html' },
              { label: '*.vue', value: 'vue' },
              { label: '*.react', value: 'react' },
            ]}
          />
        </Space>
      </Modal>
    </>
  );
};

export default HeaderContent;
