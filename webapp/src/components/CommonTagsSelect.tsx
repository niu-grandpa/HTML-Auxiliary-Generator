import { Modal, Select } from 'antd';
import { FC, memo, useCallback, useState } from 'react';
import { COMMON_TAGS } from '../assets';

type Props = Partial<{
  open: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
}>;

const CommonTagsSelect: FC<Props> = memo(({ open, onChange, onCancel }) => {
  const [value, setValue] = useState('');

  const handleSelectTag = useCallback((value: string) => {
    setValue(value);
  }, []);

  const handleOk = useCallback(() => {
    onChange?.(value);
  }, [value, onChange]);

  return (
    <Modal
      title='新建容器'
      destroyOnClose
      okText='确定'
      cancelText='取消'
      closable={false}
      onOk={handleOk}
      {...{ open, onCancel }}>
      <p style={{ marginBottom: 12, color: '#00000073' }}>
        Tip: 提供常用的HTML标签供选择, 请合理选择容器
      </p>
      <Select
        showSearch
        allowClear
        options={COMMON_TAGS}
        style={{ width: '100%' }}
        onChange={handleSelectTag}
        placeholder='请选择容器标签'
        optionFilterProp='label'
        // @ts-ignore
        filterOption={(input, option) => (option?.label ?? '').includes(input)}
      />
    </Modal>
  );
});

export { CommonTagsSelect };
