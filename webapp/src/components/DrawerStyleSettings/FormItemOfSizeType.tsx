import { Form, InputNumber, Select } from 'antd';
import { FC, memo, useCallback } from 'react';
import FormSpaceList from './FormSpaceList';

const { Option } = Select;

type Props = {
  onUnitChange?: (name: string, value: string) => void;
  items: { label: string; name: string; min?: number; defaultValue?: number }[];
};

const FormItemOfSizeType: FC<Props> = memo(({ items, onUnitChange }) => {
  const handleChange = useCallback(
    (name: string, value: string) => {
      onUnitChange?.(name, value);
    },
    [onUnitChange]
  );
  return (
    <FormSpaceList {...{ items }}>
      {fields =>
        fields.map(({ label, name, min, defaultValue }) => (
          <Form.Item {...{ name, label }} key={name}>
            <InputNumber
              style={{ width: 160 }}
              {...{ min, defaultValue }}
              addonAfter={
                <Select
                  defaultValue='px'
                  onChange={value => handleChange(name, value)}>
                  <Option value='px'>px</Option>
                  <Option value='pt'>pt</Option>
                  <Option value='%'>%</Option>
                  <Option value='rem'>rem</Option>
                  <Option value='em'>em</Option>
                  <Option value='vw'>vw</Option>
                  <Option value='vh'>vh</Option>
                </Select>
              }
            />
          </Form.Item>
        ))
      }
    </FormSpaceList>
  );
});

export default FormItemOfSizeType;
