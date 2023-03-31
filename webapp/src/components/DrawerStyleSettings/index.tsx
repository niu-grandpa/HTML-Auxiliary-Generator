import { Drawer, Form, Space } from 'antd';
import { FC, memo, useCallback, useState } from 'react';
import { useDebounce } from '../../hooks';
import FormItemOfSelectType from './FormItemOfSelectType';
import FormItemOfSizeType from './FormItemOfSizeType';
import FormItemOfTextType from './FormItemOfTextType';

import '../../assets/components/DrawerStyleSettings.less';

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

    const handleUnitChange = useCallback(
      (name: string, val: string) => {
        const obj: Record<string, string> = { ...sizeUnit };
        obj[name] = val;
        setSizeUnit(v => ({ ...v, ...obj }));
      },
      [sizeUnit]
    );

    const handleValuesChange = useDebounce((_: any, values: any) => {
      onChange?.(values);
    });

    return (
      <Drawer
        width={400}
        placement='left'
        {...{ open, onClose }}
        title='样式配置'
        extra='常用属性'
        bodyStyle={{ overflowX: 'hidden' }}>
        <Form
          className='dss-form'
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
                label: '定位',
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
                label: '上外边距',
                name: 'marginTop',
              },
              {
                label: '上内边距',
                name: 'paddingTop',
              },
              {
                label: '右外边距',
                name: 'marginRight',
              },
              {
                label: '右内边距',
                name: 'paddingRight',
              },
              {
                label: '下外边距',
                name: 'marginBottom',
              },
              {
                label: '下内边距',
                name: 'paddingBottom',
              },
              {
                label: '左外边距',
                name: 'marginLeft',
              },
              {
                label: '左内边距',
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
                label: '字体颜色',
                name: 'color',
              },
              {
                label: '上框线',
                name: 'borderTop',
              },
              {
                label: '右框线',
                name: 'borderRight',
              },
              {
                label: '下框线',
                name: 'borderBottom',
              },
              {
                label: '左框线',
                name: 'borderLeft',
              },
              {
                label: '边框圆角',
                name: 'borderRadius',
              },
              {
                label: '盒子阴影',
                name: 'boxShadow',
              },
              {
                label: '透明度',
                name: 'opacity',
              },
              {
                label: '背景样式',
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
                label: '垂直对齐',
                name: 'verticalAlign',
                options: ['top', 'bottom', 'middle', 'text-top', 'text-bottom'],
              },
              {
                label: '溢出',
                name: 'overflow',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: '文本对齐',
                name: 'textAlign',
                options: ['right', 'left', 'center', 'justify'],
              },
              {
                label: 'X轴溢出',
                name: 'overflowX',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: 'white space',
                name: 'whiteSpace',
                options: [
                  'normal',
                  'nowrap',
                  'pre',
                  'pre-wrap',
                  'pre-line',
                  'break-spaces',
                ],
              },
              {
                label: 'Y轴溢出',
                name: 'overflowY',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: 'word break',
                name: 'wordBreak',
                options: ['normal', 'break-all', 'keep-all'],
              },
              {
                label: '文本修饰',
                name: 'textDecoration',
                options: [
                  'inherit',
                  'none',
                  'underline',
                  'overline',
                  'line-through',
                  'blink',
                ],
              },
              {
                label: 'word wrap',
                name: 'wordWrap',
                options: ['normal', 'break-all'],
              },
              {
                label: '字体风格',
                name: 'fontStyle',
                options: ['normal', 'italic', 'oblique'],
              },
              {
                label: 'align items',
                name: 'alignItems',
                options: [
                  'stretch',
                  'center',
                  'flex-start',
                  'flex-end',
                  'baseline',
                  'initial',
                  'inherit',
                ],
              },
              {
                label: '字体粗细',
                name: 'fontWeight',
                options: [
                  '100',
                  '200',
                  '300',
                  '400',
                  '500',
                  '600',
                  '700',
                  'normal',
                  'bold',
                  'bolder',
                  'lighter',
                ],
              },
              {
                label: 'justify content',
                name: 'justifyContent',
                options: [
                  'flex-start',
                  'flex-end',
                  'center',
                  'space-between',
                  'space-around',
                  'initial',
                  'inherit',
                ],
              },
              {
                label: '符号列表',
                name: 'listStyleType',
                options: [
                  'disc',
                  'circle',
                  'square',
                  'decimal',
                  'lower-roman',
                  'upper-roman',
                  'lower-alpha',
                  'upper-alpha',
                  'none',
                ],
              },
              {
                label: '鼠标形状',
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
          <FormItemOfSizeType
            items={[
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
        </Form>
      </Drawer>
    );
  }
);

export { DrawerStyleSettings, FormSpaceItem };
