import { InfoCircleOutlined } from '@ant-design/icons';
import { Input, message, Modal, Select, Space } from 'antd';
import { ChangeEvent, FC, memo, useCallback, useState } from 'react';
import { COMMON_TAGS } from '../assets';

type Props = Partial<{
  open: boolean;
  onCancel: () => void;
  onChange: (res: { name: string; tag: string }) => void;
}>;

const CommonTagsSelect: FC<Props> = memo(({ open, onChange, onCancel }) => {
  const [value, setValue] = useState('');
  const [containerName, setContainerName] = useState('');

  const handleSelectTag = useCallback((value: string) => {
    setValue(value);
  }, []);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setContainerName(e.target.value);
  }, []);

  const checkResult = useCallback(() => {
    if (!containerName && !value) {
      message.error('请添加容器名和元素标签');
      return false;
    }
    if (!containerName) {
      message.info('请为容器命名');
      return false;
    }
    if (!value) {
      message.info('请选择元素标签');
      return false;
    }
    return true;
  }, [containerName, value]);

  const handleOk = useCallback(() => {
    if (!checkResult()) return;
    onCancel?.();
    onChange?.({ tag: value, name: containerName });
    setValue('');
    setContainerName('');
  }, [value, containerName, checkResult, onCancel, onChange]);

  return (
    <Modal
      title='新建'
      destroyOnClose
      okText='确定'
      cancelText='取消'
      closable={false}
      onOk={handleOk}
      {...{ open, onCancel }}>
      <p style={{ marginBottom: 12, color: '#00000073' }}>
        <InfoCircleOutlined /> 容器名将被作为独一无二的 key, 请勿重复 <br />
        <InfoCircleOutlined /> 提供常用的HTML标签供选择, 请合理选择其作为容器
      </p>
      <Space.Compact block>
        <Input onChange={handleInput} allowClear placeholder='输入容器名字' />
        <Select
          showSearch
          allowClear
          options={COMMON_TAGS}
          style={{ width: '100%' }}
          onChange={handleSelectTag}
          placeholder='选择容器元素标签'
          optionFilterProp='label'
          // @ts-ignore
          filterOption={(input, option) => (option?.label ?? '').includes(input)}
        />
      </Space.Compact>
    </Modal>
  );
});

export { CommonTagsSelect };
