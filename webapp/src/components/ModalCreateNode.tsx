import { InfoCircleOutlined } from '@ant-design/icons';
import { Input, InputNumber, message, Modal, Radio, Select, Space, Tooltip } from 'antd';
import { cloneDeep, isEqual } from 'lodash';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { COMMON_TAGS } from '../assets';
import { NodeType } from '../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../core/runtime-transform';

export type CreateNodeResult = {
  value: string;
  leaf: boolean;
  type: NodeType;
  repeat: number;
  alias: string;
  className: string;
  identity: string;
};

type Props = Partial<{
  open: boolean;
  title: string;
  type: NodeType;
  disabledRadio: boolean;
  /**隐藏文本类型操作 */
  hiddenTextType: boolean;
  /**隐藏批量创建 */
  disRepeat: boolean;
  onCancel: () => void;
  onChange: (result: CreateNodeResult) => void;
}>;

const { TextArea } = Input;

const defaultData = {
  value: '',
  leaf: false,
  type: NodeType.CONTAINER,
  repeat: 1,
  alias: '',
  className: '',
  identity: '',
};

const ModalCreateNode: FC<Props> = memo(
  ({ open, type, title, onChange, onCancel, hiddenTextType, disRepeat, disabledRadio }) => {
    const timer = useRef<any>(null);

    const [disabled, setDisabled] = useState(false);
    const [status, setStatus] = useState<'error' | ''>('');
    const [radioVal, setRadioVal] = useState<NodeType>(defaultData.type);
    const [data, setData] = useState<CreateNodeResult>(defaultData);

    const changeData = useCallback((key: string, value: any) => {
      setData(v => {
        // @ts-ignore
        v[key] = value;
        return v;
      });
    }, []);

    useEffect(() => {
      if (!isEqual(type, undefined)) {
        setRadioVal(type!);
        changeData('type', type);
      }
    }, [type, changeData]);

    useEffect(() => {
      return () => {
        clearTimeout(timer.current);
      };
    }, []);

    const initData = useCallback(() => {
      status && setStatus('');
      disabled && setDisabled(false);
      setData({ ...defaultData });
    }, [status, disabled]);

    const handleSelectTag = useCallback(
      (tag: string) => {
        if (SELF_CLOSING_TAG.includes(tag)) setDisabled(true);
        changeData('value', tag);
        status && setStatus('');
      },
      [status, changeData]
    );

    const handleChangeType = useCallback(
      ({ target }: any) => {
        const { value } = target;
        setRadioVal(value);
        changeData('type', value);
      },
      [changeData]
    );

    const hasError = useCallback((condition: boolean, msg: string) => {
      if (isEqual(condition, true)) {
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

    const callback = useCallback(
      (res: CreateNodeResult) => {
        onChange?.(res);
        handleCancel();
        changeData('leaf', res.leaf);
      },
      [onChange, handleCancel, changeData]
    );

    const handleSubmit = useCallback(() => {
      const newData = cloneDeep(data);
      const { type, value } = newData;
      const isText = isEqual(type, NodeType.TEXT);
      const leaf = isEqual(type, NodeType.SINGLE) || isText;

      newData.leaf = leaf;

      if (isText) {
        callback(newData);
        return;
      }
      if (hasError(isEqual(value, ''), '请选择标签')) return;
      if (hasError(!leaf && SELF_CLOSING_TAG.includes(value!), '自闭合元素不能作为容器')) return;
      callback(newData);
    }, [data, hasError, callback]);

    return (
      <Modal
        width={480}
        destroyOnClose
        okText='创建'
        cancelText='取消'
        closable={false}
        onOk={handleSubmit}
        onCancel={handleCancel}
        {...{ open, title }}>
        <p style={{ color: '#00000073' }}>
          <InfoCircleOutlined /> 提供常用的HTML标签, 请合理选择
        </p>
        {isEqual(radioVal, NodeType.TEXT) ? (
          <TextArea
            placeholder='输入文本内容...'
            rows={2}
            style={{ margin: '16px 0' }}
            onChange={e => changeData('value', e.target.value)}
          />
        ) : (
          <section style={{ margin: '16px 0' }}>
            <Select
              showSearch
              allowClear
              status={status}
              style={{ width: '100%' }}
              options={COMMON_TAGS}
              onChange={handleSelectTag}
              placeholder='请选择元素...'
              optionFilterProp='label'
              // @ts-ignore
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
            />
            <Space style={{ margin: '16px 0' }}>
              <Input
                addonBefore='alias'
                placeholder='列表显示的别名'
                onChange={({ target }) => changeData('alias', target.value)}
              />
              <InputNumber
                disabled={disRepeat}
                min={defaultData.repeat}
                addonBefore='重复数'
                defaultValue={defaultData.repeat}
                onChange={value => changeData('repeat', value)}
              />
            </Space>
            <Space>
              <Input
                addonBefore='class'
                placeholder='元素类名'
                onChange={({ target }) => changeData('className', target.value)}
              />
              <Input
                addonBefore='identit'
                placeholder='元素id'
                onChange={({ target }) => changeData('identity', target.value)}
              />
            </Space>
          </section>
        )}
        {!disabledRadio && (
          <Radio.Group value={radioVal} onChange={handleChangeType}>
            <Radio value={NodeType.CONTAINER} disabled={disabled || type === NodeType.TEXT}>
              <Tooltip title='允许在此节点下嵌套子节点'>容器节点</Tooltip>
            </Radio>
            <Radio value={NodeType.SINGLE} disabled={type === NodeType.TEXT}>
              <Tooltip title='无法嵌套除了文本外的节点'>单独节点</Tooltip>
            </Radio>
            <Radio value={NodeType.TEXT} disabled={disabled || hiddenTextType}>
              <Tooltip title='添加一段文本内容'>文本节点</Tooltip>
            </Radio>
          </Radio.Group>
        )}
      </Modal>
    );
  }
);

export { ModalCreateNode };
