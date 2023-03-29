import { Drawer, Form, Space } from 'antd';
import { FC, memo, useCallback, useState } from 'react';
import FormItemOfSizeType from './FormItemOfSizeType';

import '../../assets/components/DrawerStyleSettings.less';
import FormItemOfSelectType from './FormItemOfSelectType';
import FormItemOfTextType from './FormItemOfTextType';

export type StyleFormValues = {};

type Props = {
  open: boolean;
  initialValues: any;
  onClose: () => void;
  onChange: (data: any) => void;
};

const FormSpaceItem = memo(({ children }: { children: JSX.Element[] }) => (
  <Form.Item>
    <Space>{children}</Space>
  </Form.Item>
));

const DrawerStyleSettings: FC<Partial<Props>> = memo(
  ({ open, onClose, onChange, initialValues }) => {
    const [sizeUnit, setSizeUnit] = useState<Record<string, string>>({});

    const handleUnitChange = useCallback((name: string, val: string) => {
      const obj: Record<string, string> = {};
      obj[name] = val;
      setSizeUnit(v => ({ ...v, ...obj }));
    }, []);

    const handleValuesChange = useCallback((_: any, values: any) => {
      console.log(values);
    }, []);

    return (
      <Drawer
        placement='left'
        {...{ open, onClose }}
        title='样式风格调整'
        bodyStyle={{ overflowX: 'hidden' }}>
        <Form
          className='dss-form'
          size='small'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 12 }}
          layout='inline'
          {...{ initialValues }}
          onValuesChange={handleValuesChange}>
          <FormItemOfSelectType
            items={[
              {
                label: 'display',
                name: 'display',
                options: [
                  'none',
                  'inline',
                  'block',
                  'inline-block',
                  'flex',
                  'inline-flex',
                  'grid',
                  'inline-grid',
                  'table',
                  'inline-table',
                  'list-item',
                  'inherit',
                ],
              },
              {
                label: 'position',
                name: 'position',
                options: [
                  'static ',
                  'relative ',
                  'absolute ',
                  'sticky ',
                  'fixed',
                ],
              },
            ]}
          />
          <FormItemOfSizeType
            items={[
              {
                label: '宽度',
                name: 'width',
              },
              {
                label: '高度',
                name: 'height',
              },
              {
                label: '行高',
                name: 'lineHeight',
              },
              {
                label: '文字大小',
                name: 'fontSize',
              },
              {
                label: '字间距离',
                name: 'letterSpacing',
              },
              {
                label: '单词间距',
                name: 'wordSpacing',
              },
            ]}
            onUnitChange={handleUnitChange}
          />
          <FormItemOfTextType
            items={[
              {
                label: '外边距',
                name: 'margin',
              },
              {
                label: '内边距',
                name: 'padding',
              },
            ]}
          />
          <FormItemOfSizeType
            items={[
              {
                label: 'margin-top',
                name: 'marginTop',
              },
              {
                label: 'padding-top',
                name: 'paddingTop',
              },
              {
                label: 'margin-right',
                name: 'marginRight',
              },
              {
                label: 'padding-right',
                name: 'paddingRight',
              },
              {
                label: 'margin-bottom',
                name: 'marginBottom',
              },
              {
                label: 'padding-bottom',
                name: 'paddingBottom',
              },
              {
                label: 'margin-left',
                name: 'marginLeft',
              },
              {
                label: 'padding-left',
                name: 'paddingLeft',
              },
            ]}
            onUnitChange={handleUnitChange}
          />
          <FormItemOfTextType
            items={[
              {
                label: '边框',
                name: 'border',
              },
              {
                label: 'border-top',
                name: 'border',
              },
              {
                label: 'border-right',
                name: 'border',
              },
              {
                label: 'border-bottom',
                name: 'border',
              },
              {
                label: 'border-left',
                name: 'border',
              },
              {
                label: '字体颜色',
                name: 'color',
              },
              {
                label: '字体类型',
                name: 'font-family',
              },
              {
                label: '背景',
                name: 'background',
              },
            ]}
          />
          <FormItemOfSelectType
            items={[
              {
                label: 'visibility',
                name: 'visibility',
                options: ['hidden', 'visible', 'collapse'],
              },
              {
                label: 'vertical-align',
                name: 'verticalAlign',
                options: ['top', 'bottom', 'middle', 'text-top', 'text-bottom'],
              },
              {
                label: 'overflow',
                name: 'overflow',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: 'overflow-x',
                name: 'overflowX',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: 'overflow-y',
                name: 'overflowY',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: '鼠标光标',
                name: 'cursor',
                options: [
                  'default',
                  'auto',
                  'crosshair',
                  'pointer',
                  'move',
                  'e-resize',
                  'ne-resize',
                  'nw-resize',
                  'n-resize',
                  's-resize',
                  'se-resize',
                  'sw-resize',
                  'w-resize',
                  'text',
                  'wait',
                  'help',
                  'not-allowed',
                  'no-drop',
                ],
              },
            ]}
          />
        </Form>
      </Drawer>
    );
  }
);

export { DrawerStyleSettings, FormSpaceItem };
