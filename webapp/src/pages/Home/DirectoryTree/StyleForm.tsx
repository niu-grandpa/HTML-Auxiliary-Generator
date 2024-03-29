import { Form, Input, InputNumber, Select, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { forIn, isEqual, keys } from 'lodash';
import { memo, useCallback, useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks';
import { getStringPxToNumber } from '../../../utils';

export type StyleFormValueType = React.CSSProperties;
type Props = {
  defaultValues: StyleFormValueType;
  onValuesChange: (values: StyleFormValueType) => void;
};

const StyleForm = memo<Props>(({ defaultValues, onValuesChange }) => {
  const [form] = Form.useForm();
  const [unitObj, setUnitObj] = useState<Record<any, any>>({});

  useEffect(() => {
    if (keys(defaultValues).length) {
      const [x, y] = getStringPxToNumber(defaultValues.translate as string);
      form.setFieldsValue({
        ...defaultValues,
        'x-coordinate': x,
        'y-coordinate': y,
      });
    } else {
      form.resetFields();
    }
  }, [form, defaultValues]);

  const processUnit = useCallback(
    (values: StyleFormValueType, name: string, unit: string) => {
      // @ts-ignore
      const val = values[name];
      // @ts-ignore
      values[name] = val + (isEqual(unit, 'none') ? '' : unit);
    },
    []
  );

  const processCoordinate = useCallback(
    (cur: any, values: StyleFormValueType) => {
      let { translate } = defaultValues;
      if (cur['x-coordinate'] || cur['y-coordinate']) {
        const [x, y] = getStringPxToNumber(translate as string);
        if (cur['x-coordinate']) translate = `${cur['x-coordinate']}px ${y}px`;
        if (cur['y-coordinate']) translate = `${x}px ${cur['y-coordinate']}px`;
      }
      values.translate = translate;
      // @ts-ignore
      delete values['x-coordinate'];
      // @ts-ignore
      delete values['y-coordinate'];
    },
    [defaultValues]
  );

  const handleSetUnit = useCallback(
    (unit: string, name: string) => {
      processUnit(form.getFieldsValue(), name, unit);
      setUnitObj(val => {
        val[name] = unit;
        return val;
      });
    },
    [form, processUnit]
  );

  const handleValuesChange = useDebounce((cur, values: StyleFormValueType) => {
    processCoordinate(cur, values);
    forIn(unitObj, (unit, name) => processUnit(values, name, unit));
    onValuesChange(values);
  });

  return (
    <Form
      {...{ form }}
      size='small'
      layout='vertical'
      autoComplete='off'
      className='style-form'
      onValuesChange={handleValuesChange}>
      <Space>
        <FormItemOfInputNumber
          closeUnit
          onUnitChange={handleSetUnit}
          name='x-coordinate'
        />
        <FormItemOfInputNumber
          closeUnit
          onUnitChange={handleSetUnit}
          name='y-coordinate'
        />
      </Space>
      <Space>
        <FormItemOfSelect
          name='display'
          options={['none', 'block', 'flex', 'inline', 'grid', 'table']}
        />
        <FormItemOfSelect
          name='visibility'
          options={['collapse', 'hidden', 'visible', 'inherit']}
        />
      </Space>
      <Space>
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='width' />
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='height' />
      </Space>
      <Space>
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='fontSize' />
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='lineHight' />
      </Space>
      <Space>
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='maxWidth' />
        <FormItemOfInputNumber onUnitChange={handleSetUnit} name='maxHeight' />
      </Space>
      <Space>
        <Form.Item label='margin' name='margin'>
          <Input />
        </Form.Item>
        <Form.Item label='padding' name='padding'>
          <Input />
        </Form.Item>
      </Space>
      <Form.Item label='color' name='color'>
        <Input
          type='color'
          defaultValue='#000000'
          style={{ cursor: 'pointer' }}
        />
      </Form.Item>
      <Form.Item label='background' name='background'>
        <Input />
      </Form.Item>
      <Form.Item label='border' name='border'>
        <Input />
      </Form.Item>
      <Form.Item label='boxShadow' name='boxShadow'>
        <Input />
      </Form.Item>
      <Space>
        <FormItemOfSelect
          name='textAlign'
          options={['right', 'left', 'center', 'justify']}
        />
        <FormItemOfSelect
          name='verticalAlign'
          options={[
            'top',
            'bottom',
            'middle',
            'text-top',
            'text-bottom',
            'sub',
            'super',
          ]}
        />
      </Space>
      <Space>
        <FormItemOfInputNumber
          onUnitChange={handleSetUnit}
          name='borderRadius'
        />
        <FormItemOfInputNumber
          onUnitChange={handleSetUnit}
          name='letterSpacing'
        />
      </Space>
      <Space>
        <Form.Item label='textShadow' name='textShadow'>
          <Input />
        </Form.Item>
        <Form.Item label='fontFamily' name='fontFamily'>
          <Input />
        </Form.Item>
      </Space>
      <Space>
        <FormItemOfSelect
          name='fontWeight'
          options={[100, 200, 300, 400, 500, 600, 700, 800, 900]}
        />
        <FormItemOfSelect
          name='fontStyle'
          options={['inherit', 'italic', 'normal', 'oblique']}
        />
      </Space>
      <Space>
        <FormItemOfInputNumber
          onUnitChange={handleSetUnit}
          name='zIndex'
          closeUnit
        />
        <FormItemOfInputNumber
          onUnitChange={handleSetUnit}
          name='opacity'
          closeUnit
          step={0.01}
        />
      </Space>
      <Space>
        <FormItemOfSelect
          name='whiteSpace'
          options={[
            'normal',
            'nowrap',
            'pre',
            'pre-wrap',
            'pre-line',
            'break-spaces',
          ]}
        />
        <FormItemOfSelect
          name='wordBreak'
          options={['normal', 'break-all', 'keep-all']}
        />
      </Space>
      <Space>
        <FormItemOfSelect
          name='cursor'
          options={[
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
          ]}
        />
        <FormItemOfSelect
          name='textDecoration'
          options={['overline', 'underline', 'none', 'line-through']}
        />
      </Space>
      <Space>
        <FormItemOfSelect
          name='overflowX'
          options={['auto', 'scroll', 'hidden', 'visible']}
        />
        <FormItemOfSelect
          name='overflowY'
          options={['auto', 'scroll', 'hidden', 'visible']}
        />
      </Space>
    </Form>
  );
});

const sizeUnit: DefaultOptionType[] = [
  {
    label: 'px',
    value: 'px',
  },
  {
    label: '%',
    value: '%',
  },
  {
    label: 'rem',
    value: 'rem',
  },
  {
    label: 'em',
    value: 'em',
  },
  {
    label: 'vw',
    value: 'vw',
  },
  {
    label: 'vh',
    value: 'vh',
  },
  {
    label: 'none',
    value: 'none',
  },
];

type FormItemProps = {
  label?: string;
  name: string;
};

const FormItemOfInputNumber = memo<
  FormItemProps & {
    closeUnit?: boolean;
    step?: number;
    onUnitChange?: (val: string, name: string) => void;
  }
>(({ label, name, step, closeUnit, onUnitChange }) => {
  const handleChange = useCallback(
    (unit: string) => {
      onUnitChange?.(unit, name);
    },
    [onUnitChange, name]
  );

  return (
    <Form.Item {...{ name }} label={label || name}>
      <InputNumber
        min={0}
        {...{ step }}
        style={{ width: 132 }}
        addonAfter={
          !closeUnit && (
            <Select
              className='style-form-select'
              defaultValue='px'
              options={sizeUnit}
              onChange={handleChange}
            />
          )
        }
      />
    </Form.Item>
  );
});

const FormItemOfSelect = memo<FormItemProps & { options: (string | number)[] }>(
  ({ label, name, options }) => {
    return (
      <Form.Item {...{ name }} label={label || name}>
        <Select
          allowClear
          style={{ width: 132 }}
          options={options.map(item => ({ label: item, value: item }))}
        />
      </Form.Item>
    );
  }
);

export default StyleForm;
