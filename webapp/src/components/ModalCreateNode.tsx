import { InfoCircleOutlined } from '@ant-design/icons';
import { Input, message, Modal, Radio, RadioChangeEvent, Select, Tooltip } from 'antd';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { COMMON_TAGS } from '../assets';
import { SELF_CLOSING_TAG } from '../core/runtime-transform';

type Props = Partial<{
  open: boolean;
  title: string;
  custom: 'leaf' | 'non-leaf';
  onCancel: () => void;
  onChange: (tagName: string, isLeaf: boolean) => void;
}>;

const enum CreateNodeType {
  CONTAINER,
  SINGLE,
  TEXT,
}

const { TextArea } = Input;

const ModalCreateNode: FC<Props> = memo(({ open, title, custom, onChange, onCancel }) => {
  const timer = useRef<any>(null);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'error' | ''>('');
  const [disabled, setDisabled] = useState(false);
  const [nodeType, setNodeType] = useState<CreateNodeType>(CreateNodeType.CONTAINER);

  const initData = useCallback(() => {
    value && setValue('');
    status && setStatus('');
    disabled && setDisabled(false);
    nodeType > 0 && setNodeType(CreateNodeType.CONTAINER);
  }, [value, status, disabled, nodeType]);

  const handleSelectTag = useCallback(
    (value: string) => {
      if (SELF_CLOSING_TAG.includes(value)) {
        setDisabled(true);
        setNodeType(CreateNodeType.CONTAINER);
      }
      setValue(value);
      status && setStatus('');
    },
    [status]
  );

  const handleChangeType = useCallback(({ target }: RadioChangeEvent) => {
    setNodeType(target.value);
  }, []);

  const hasError = useCallback((condition: boolean, msg: string) => {
    if (condition) {
      setStatus('error');
      message.error(msg);
      timer.current = setTimeout(() => {
        setStatus('');
      }, 2000);
      return true;
    }
    return false;
  }, []);

  const handleCancel = useCallback(() => {
    onCancel?.();
    initData();
  }, [onCancel, initData]);

  const handleOk = useCallback(() => {
    if (hasError(value === '', '请选择标签')) return;
    const isLeaf = !custom ? nodeType === CreateNodeType.SINGLE : custom === 'leaf';
    if (hasError(!isLeaf && SELF_CLOSING_TAG.includes(value), '自闭合标签不能作为容器节点')) return;
    onChange?.(value, isLeaf);
    handleCancel();
  }, [onChange, value, custom, nodeType, hasError, handleCancel]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <Modal
      destroyOnClose
      okText='确定'
      cancelText='取消'
      closable={false}
      onOk={handleOk}
      onCancel={handleCancel}
      {...{ open, title }}>
      <p style={{ marginBottom: 12, color: '#00000073' }}>
        <InfoCircleOutlined /> 提供常用的HTML标签供选择, 请合理选择
      </p>
      {nodeType === CreateNodeType.TEXT ? (
        <TextArea placeholder='输入文本内容...' rows={2} style={{ marginBottom: 12 }} />
      ) : (
        <Select
          showSearch
          allowClear
          status={status}
          options={COMMON_TAGS}
          style={{ width: '100%', marginBottom: 16 }}
          onChange={handleSelectTag}
          placeholder='请选择元素...'
          optionFilterProp='label'
          // @ts-ignore
          filterOption={(input, option) => (option?.label ?? '').includes(input)}
        />
      )}
      {!custom ? (
        <Radio.Group value={nodeType} onChange={handleChangeType}>
          <Radio value={CreateNodeType.CONTAINER} {...{ disabled }}>
            <Tooltip title='允许在此节点下嵌套子节点'>容器节点</Tooltip>
          </Radio>
          <Radio value={CreateNodeType.SINGLE}>
            <Tooltip title='无法嵌套除了文本外的节点'>单独节点</Tooltip>
          </Radio>
          <Radio value={CreateNodeType.TEXT} {...{ disabled }}>
            <Tooltip title='文本'>文本节点</Tooltip>
          </Radio>
        </Radio.Group>
      ) : (
        <Radio checked>{custom === 'leaf' ? '单独节点' : '容器节点'}</Radio>
      )}
    </Modal>
  );
});

export { ModalCreateNode };
