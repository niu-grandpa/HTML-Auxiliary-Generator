import { Drawer, Form } from 'antd';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import FormItemOfSelectType from './FormItemOfSelectType';
import FormItemOfSizeType from './FormItemOfSizeType';
import FormItemOfTextType from './FormItemOfTextType';

import { useForm } from 'antd/es/form/Form';
import { isEqual, isUndefined } from 'lodash';
import '../../assets/components/DrawerStyleSettings.less';
import { useDebounce } from '../../hooks';

export type StyleFormValues = Record<string, string | number>;

type Props = {
  open: boolean;
  initialValues: any;
  onClose: () => void;
  onChange: (data: any) => void;
};

const DrawerStyleSettings: FC<Partial<Props>> = memo(
  ({ open, onClose, onChange, initialValues }) => {
    const [form] = useForm();
    const [sizeUnit, setSizeUnit] = useState<Record<string, string>>({});

    useEffect(() => {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }, [form, initialValues]);

    const processValues = useCallback(
      (values: StyleFormValues, sizeUnit: Record<string, string>) => {
        if (
          isUndefined(sizeUnit['lineHeight']) &&
          !isUndefined(values.lineHeight)
        ) {
          values.lineHeight = `${values.lineHeight}px`;
        }
        for (const key in sizeUnit) {
          const unit = sizeUnit[key];
          // @ts-ignore
          const value = values[key];
          // @ts-ignore
          values[key] = isEqual(unit, 'empty') ? value : `${value}${unit}`;
        }
        return values;
      },
      []
    );

    const handleUnitChange = useCallback(
      (name: string, val: string) => {
        const obj: Record<string, string> = { ...sizeUnit };
        obj[name] = val;
        setSizeUnit(v => ({ ...v, ...obj }));
        onChange?.(processValues(form.getFieldsValue(), obj));
      },
      [sizeUnit, form, processValues, onChange]
    );

    const handleValuesChange = useDebounce((_, values: StyleFormValues) => {
      onChange?.(processValues(values, sizeUnit));
    }, 400);

    return (
      <Drawer
        mask={false}
        destroyOnClose
        placement='right'
        {...{ open, onClose }}
        title='常用样式'
        bodyStyle={{ overflowX: 'hidden' }}>
        <Form
          {...{ form }}
          layout='inline'
          className='dss-form'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 12 }}
          onValuesChange={handleValuesChange}>
          <FormItemOfSelectType
            items={[
              {
                label: 'display',
                name: 'display',
                options: [
                  'none',
                  'inherit',
                  'inline',
                  'inline-flex',
                  'inline-block',
                ],
              },
              {
                label: 'visibility',
                name: 'visibility',
                options: ['hidden', 'visible', 'collapse'],
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
              {
                label: '文本对齐',
                name: 'textAlign',
                options: ['right', 'left', 'center', 'justify'],
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
                label: '最小宽度',
                name: 'minWidth',
              },
              {
                label: '最大宽度',
                name: 'maxWidth',
              },
              {
                label: '最小高度',
                name: 'minHeight',
              },
              {
                label: '最大高度',
                name: 'maxHeight',
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
                label: '上外边距',
                name: 'marginTop',
              },
              {
                label: '右外边距',
                name: 'marginRight',
              },
              {
                label: '下外边距',
                name: 'marginBottom',
              },
              {
                label: '左外边距',
                name: 'marginLeft',
              },
              {
                label: '上内边距',
                name: 'paddingTop',
              },
              {
                label: '右内边距',
                name: 'paddingRight',
              },
              {
                label: '下内边距',
                name: 'paddingBottom',
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
                label: '上边框',
                name: 'borderTop',
              },
              {
                label: '右边框',
                name: 'borderRight',
              },
              {
                label: '下边框',
                name: 'borderBottom',
              },
              {
                label: '左边框',
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
                label: '背景',
                name: 'background',
              },
              {
                label: '字体颜色',
                name: 'color',
              },
              {
                label: '过渡效果',
                name: 'transition',
              },
            ]}
          />
          <FormItemOfSelectType
            items={[
              {
                label: '浮动',
                name: 'userSelect',
                options: ['none ', 'left', 'right'],
              },
              {
                label: '溢出',
                name: 'overflow',
                options: ['auto', 'scroll', 'hidden', 'visible'],
              },
              {
                label: '垂直对齐',
                name: 'verticalAlign',
                options: ['top', 'bottom', 'middle', 'text-top', 'text-bottom'],
              },
              {
                label: 'X轴溢出',
                name: 'overflowX',
                options: ['auto', 'scroll', 'hidden', 'visible'],
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
                label: 'Y轴溢出',
                name: 'overflowY',
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
                label: 'word break',
                name: 'wordBreak',
                options: ['normal', 'break-all', 'keep-all'],
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
                label: '堆叠层级',
                name: 'zIndex',
              },
            ]}
            onUnitChange={handleUnitChange}
          />
        </Form>
      </Drawer>
    );
  }
);

export { DrawerStyleSettings };
