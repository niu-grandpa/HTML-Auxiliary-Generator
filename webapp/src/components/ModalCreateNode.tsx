import { InfoCircleOutlined } from '@ant-design/icons';
import { message, Modal, Radio, RadioChangeEvent, Select, Tooltip } from 'antd';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { COMMON_TAGS } from '../assets';
import { SELF_CLOSING_TAG } from '../core/runtime-transform';

type Props = Partial<{
  open: boolean;
  title: string;
  custom?: 'leaf' | 'non-leaf';
  onCancel: () => void;
  onChange: (tagName: string, isLeaf: boolean) => void;
}>;

const ModalCreateNode: FC<Props> = memo(({ open, title, custom, onChange, onCancel }) => {
  const timer = useRef<any>(null);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'error' | ''>('');
  const [radioChecked, setRadioChecked] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const initData = useCallback(() => {
    value && setValue('');
    status && setStatus('');
    disabled && setDisabled(false);
    radioChecked === 1 && setRadioChecked(0);
  }, [value, status, disabled, radioChecked]);

  const handleSelectTag = useCallback(
    (value: string) => {
      if (SELF_CLOSING_TAG.includes(value)) {
        setRadioChecked(1);
        setDisabled(true);
      }
      status && setStatus('');
      setValue(value);
    },
    [status]
  );

  const handleRadio = useCallback(({ target }: RadioChangeEvent) => {
    setRadioChecked(target.value);
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
    const isLeaf = !custom ? radioChecked === 1 : custom === 'leaf';
    if (hasError(!isLeaf && SELF_CLOSING_TAG.includes(value), '自闭合标签不能作为容器节点')) return;
    onChange?.(value, isLeaf);
    handleCancel();
  }, [onChange, value, custom, radioChecked, hasError, handleCancel]);

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
      {!custom ? (
        <Radio.Group value={radioChecked} onChange={handleRadio}>
          <Radio value={0} disabled={disabled}>
            <Tooltip title='允许在此节点下再新建子节点'>容器节点</Tooltip>
          </Radio>
          <Radio value={1}>
            <Tooltip title='无法再为其添加子节点'>单独节点</Tooltip>
          </Radio>
        </Radio.Group>
      ) : (
        <Radio checked>{custom === 'leaf' ? '单独节点' : '容器节点'}</Radio>
      )}
    </Modal>
  );
});

export { ModalCreateNode };
