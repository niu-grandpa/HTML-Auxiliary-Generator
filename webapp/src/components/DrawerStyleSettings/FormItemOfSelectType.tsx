import { Form, Select } from 'antd';
import { FC, memo } from 'react';
import FormSpaceList from './FormSpaceList';

type Props = {
  items: {
    label: string;
    name: string;
    options: string[];
  }[];
};

const FormItemOfSelectType: FC<Props> = memo(({ items }) => {
  return (
    <FormSpaceList {...{ items }}>
      {fiedls =>
        fiedls.map(({ label, name, options }) => {
          const _options = (options as string[]).map(s => ({
            label: s,
            value: s,
          }));
          return (
            <Form.Item {...{ label, name }} key={name}>
              <Select allowClear style={{ width: 120 }} options={_options} />
            </Form.Item>
          );
        })
      }
    </FormSpaceList>
  );
});

export default FormItemOfSelectType;
