import { InfoCircleOutlined } from '@ant-design/icons';
import { Modal, Radio, RadioChangeEvent, Select, Tooltip } from 'antd';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { COMMON_TAGS } from '../assets';

type Props = Partial<{
  open: boolean;
  title: string;
  custom: 'leaf' | 'not-leaf';
  onCancel: () => void;
  onChange: (tagName: string, isLeaf: boolean) => void;
}>;

const ModalCreateNode: FC<Props> = memo(({ open, title, custom, onChange, onCancel }) => {
  const timer = useRef<any>(null);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'error' | ''>('');
  const [isLeaf, setIsLeaf] = useState(0);

  const handleSelectTag = useCallback((value: string) => {
    setStatus('');
    setValue(value);
  }, []);

  const handleRadio = useCallback(({ target }: RadioChangeEvent) => {
    setIsLeaf(target.value);
  }, []);

  const initData = useCallback(() => {
    setValue('');
    setStatus('');
    setIsLeaf(0);
  }, []);

  const handleOk = useCallback(() => {
    if (!value) {
      setStatus('error');
      timer.current = setTimeout(() => {
        setStatus('');
      }, 2000);
      return;
    }
    const type = !custom ? isLeaf === 1 : custom === 'leaf';
    onChange?.(value, type);
    onCancel?.();
  }, [onChange, onCancel, value, custom, isLeaf]);

  useEffect(() => {
    initData();
    return () => {
      clearTimeout(timer.current);
    };
  }, [initData]);

  return (
    <Modal
      destroyOnClose
      okText='确定'
      cancelText='取消'
      closable={false}
      onOk={handleOk}
      {...{ open, title, onCancel }}>
      <p style={{ marginBottom: 12, color: '#00000073' }}>
        <InfoCircleOutlined /> 提供常用的HTML标签供选择, 请合理选择
      </p>
      <Select
        showSearch
        allowClear
        status={status}
        options={COMMON_TAGS}
        style={{ width: '100%', marginBottom: 16 }}
        onChange={handleSelectTag}
        placeholder='请选择...'
        optionFilterProp='label'
        // @ts-ignore
        filterOption={(input, option) => (option?.label ?? '').includes(input)}
      />
      {!custom && (
        <Radio.Group value={isLeaf} onChange={handleRadio}>
          <Radio value={0}>
            <Tooltip title='允许在此节点下再新建子节点'>容器节点</Tooltip>
          </Radio>
          <Radio value={1}>
            <Tooltip title='无法再为其添加子节点'>单独节点</Tooltip>
          </Radio>
        </Radio.Group>
      )}
    </Modal>
  );
});

export { ModalCreateNode };
