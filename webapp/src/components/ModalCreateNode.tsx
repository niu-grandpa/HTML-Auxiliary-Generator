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
  const [disParent, setDisParent] = useState(false);

  const initData = useCallback(() => {
    setValue('');
    setStatus('');
    setRadioChecked(0);
    setDisParent(false);
  }, []);

  const handleSelectTag = useCallback((value: string) => {
    if (SELF_CLOSING_TAG.includes(value)) {
      setRadioChecked(1);
      setDisParent(true);
    }
    setStatus('');
    setValue(value);
  }, []);

  const handleRadio = useCallback(({ target }: RadioChangeEvent) => {
    setRadioChecked(target.value);
  }, []);

  const notSelected = useCallback(() => {
    if (!value) {
      setStatus('error');
      message.error('请选择标签');
      timer.current = setTimeout(() => {
        setStatus('');
      }, 2000);
      return true;
    }
    return false;
  }, [value]);

  const handleOk = useCallback(() => {
    if (notSelected()) return;
    // 默认创建容器节点类型
    const isLeaf = !custom ? radioChecked === 1 : custom === 'leaf';
    onCancel?.();
    onChange?.(value, isLeaf);
  }, [onChange, onCancel, value, custom, radioChecked, notSelected]);

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
      {!custom ? (
        <Radio.Group value={radioChecked} onChange={handleRadio}>
          <Radio value={0} disabled={disParent}>
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
