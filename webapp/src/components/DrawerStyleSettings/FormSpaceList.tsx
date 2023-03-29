import { Form, Space } from 'antd';
import { chunk } from 'lodash';
import { FC, memo, useMemo } from 'react';

type Props<T> = {
  items: T[];
  children: (fields: T[]) => JSX.Element[];
};

const FormSpaceList: FC<Props<Record<string, any>>> = memo(
  ({ items, children }) => {
    const splitItems = useMemo(() => chunk(items, 2), [items]);
    return (
      <>
        {splitItems?.map((fields, idx) => (
          <Form.Item key={idx}>
            <Space>{children(fields)}</Space>
          </Form.Item>
        ))}
      </>
    );
  }
);

export default FormSpaceList;
