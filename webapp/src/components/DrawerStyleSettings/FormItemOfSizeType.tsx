import { Form, InputNumber, Select, Space } from 'antd';
import { chunk } from 'lodash';
import { FC, memo, useCallback, useMemo } from 'react';

const { Option } = Select;

type Props = {
  onUnitChange?: (name: string, value: string) => void;
  items: { label: string; name: string; min?: number; defaultValue?: number }[];
};

const FormItemOfSizeType: FC<Props> = memo(({ items, onUnitChange }) => {
  const splitItems = useMemo(() => chunk(items, 2), [items]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      onUnitChange?.(name, value);
    },
    [onUnitChange]
  );

  return (
    <>
      {splitItems?.map((items, idx) => (
        <Form.Item key={idx}>
          <Space>
            {items.map(({ label, name, min, defaultValue }) => (
              <Form.Item {...{ name, label }} key={name}>
                <InputNumber
                  style={{ width: 150 }}
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
            ))}
          </Space>
        </Form.Item>
      ))}
    </>
  );
});

export default FormItemOfSizeType;
