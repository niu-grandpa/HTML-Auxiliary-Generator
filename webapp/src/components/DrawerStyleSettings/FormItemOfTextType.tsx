import { Form, Input } from 'antd';
import { FC, memo } from 'react';
import FormSpaceList from './FormSpaceList';

type Props = {
  items: { label: string; name: string }[];
};

const FormItemOfTextType: FC<Props> = memo(({ items }) => {
  return (
    <FormSpaceList {...{ items }}>
      {fiedls =>
        fiedls.map(({ label, name }) => (
          <Form.Item {...{ label, name }} key={name}>
            <Input autoComplete='off' style={{ width: 160 }} />
          </Form.Item>
        ))
      }
    </FormSpaceList>
  );
});

export default FormItemOfTextType;
