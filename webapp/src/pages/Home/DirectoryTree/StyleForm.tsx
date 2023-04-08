import { Form, Input, InputNumber, Select, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { memo } from 'react';

const StyleForm = memo(() => {
  const [form] = Form.useForm();

  return (
    <Form
      autoComplete='off'
      {...{ form }}
      size='small'
      className='style-form'
      layout='vertical'>
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
        <FormItemOfInputNumber name='width' />
        <FormItemOfInputNumber name='height' />
      </Space>
      <Space>
        <FormItemOfInputNumber name='fontSize' />
        <FormItemOfInputNumber name='lineHight' />
      </Space>
      <Space>
        <FormItemOfInputNumber name='maxWidth' />
        <FormItemOfInputNumber name='maxHeight' />
      </Space>
      <Space>
        <Form.Item label='color' name='color'>
          <Input />
        </Form.Item>
        <Form.Item label='background' name='background'>
          <Input />
        </Form.Item>
      </Space>
      <Space>
        <Form.Item label='margin' name='margin'>
          <Input />
        </Form.Item>
        <Form.Item label='padding' name='padding'>
          <Input />
        </Form.Item>
      </Space>
      <Space>
        <Form.Item label='border' name='border'>
          <Input />
        </Form.Item>
        <Form.Item label='boxShadow' name='boxShadow'>
          <Input />
        </Form.Item>
      </Space>
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
        <FormItemOfInputNumber name='zIndex' />
        <FormItemOfInputNumber name='letterSpacing' />
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
          name='backgroundSize'
          options={['auto', 'cover', 'contain']}
        />
        <FormItemOfSelect
          label='bgcAttachment'
          name='backgroundAttachment'
          options={['fixed', 'scroll', 'local']}
        />
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
        <FormItemOfInputNumber name='opacity' closeUnit step={0.01} />
        <FormItemOfInputNumber name='scale' closeUnit step={0.01} />
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
          name='overflow'
          options={['auto', 'scroll', 'hidden', 'visible']}
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
  FormItemProps & { closeUnit?: boolean; step?: number }
>(({ label, name, step, closeUnit }) => {
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
          style={{ width: 132 }}
          options={options.map(item => ({ label: item, value: item }))}
        />
      </Form.Item>
    );
  }
);

export default StyleForm;
