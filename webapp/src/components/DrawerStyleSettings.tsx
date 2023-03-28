import { Drawer, Form, Space } from 'antd';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import FormItemOfSizeType from './FormItemOfSizeType';

import '../assets/components/DrawerStyleSettings.less';

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
    const sizeCategory = useRef([
      {
        label: '宽度',
        name: 'width',
      },
      {
        label: '高度',
        name: 'height',
      },
      {
        label: '(内)上边距',
        name: 'paddingTop',
      },
      {
        label: '(内)下边距',
        name: 'paddingBottom',
      },
      {
        label: '(内)左边距',
        name: 'paddingLeft',
      },
      {
        label: '(内)右边距',
        name: 'paddingRight',
      },
      {
        label: '(外)上边距',
        name: 'marginTop',
      },
      {
        label: '(外)下边距',
        name: 'marginBottom',
      },
      {
        label: '(外)左边距',
        name: 'marginLeft',
      },
      {
        label: '(外)右边距',
        name: 'marginRight',
      },
    ]);

    const [sizeUnit, setSizeUnit] = useState<Record<string, string>>({});

    const setDefaultSizeUnit = useCallback(() => {
      const obj: Record<string, string> = {};
      sizeCategory.current.forEach(({ name }) => {
        obj[name] = 'px';
      });
      setSizeUnit(obj);
    }, []);

    useEffect(() => {
      setDefaultSizeUnit();
    }, [setDefaultSizeUnit]);

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
        mask={false}
        bodyStyle={{ overflowX: 'hidden' }}>
        <Form
          className='dss-form'
          size='small'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 12 }}
          layout='inline'
          {...{ initialValues }}
          onValuesChange={handleValuesChange}>
          <FormItemOfSizeType
            items={sizeCategory.current}
            onUnitChange={handleUnitChange}
          />
        </Form>
      </Drawer>
    );
  }
);

export { DrawerStyleSettings, FormSpaceItem };
