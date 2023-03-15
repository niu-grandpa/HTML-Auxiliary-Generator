import { InfoCircleOutlined } from '@ant-design/icons';
import { Input, message, Modal, Radio, Select, Tooltip } from 'antd';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { COMMON_TAGS } from '../assets';
import { NodeType } from '../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../core/runtime-transform';

export type CreateNodeResult = { value: string; leaf: boolean; type: NodeType };

type Props = Partial<{
  open: boolean;
  title: string;
  type: NodeType;
  hiddenTextType: boolean;
  onCancel: () => void;
  onChange: (result: CreateNodeResult) => void;
}>;

const { TextArea } = Input;

const ModalCreateNode: FC<Props> = memo(
  ({ open, type, title, onChange, onCancel, hiddenTextType }) => {
    const timer = useRef<any>(null);
    const [text, setText] = useState('');
    const [tagName, setTagName] = useState('');
    const [status, setStatus] = useState<'error' | ''>('');
    const [disabled, setDisabled] = useState(false);
    const [nodeType, setNodeType] = useState<NodeType>(NodeType.CONTAINER);

    useEffect(() => {
      if (type !== undefined) setNodeType(type);
    }, [type]);

    const initData = useCallback(() => {
      tagName && setTagName('');
      status && setStatus('');
      disabled && setDisabled(false);
      nodeType > 0 && setNodeType(NodeType.CONTAINER);
    }, [tagName, status, disabled, nodeType]);

    const handleSelectTag = useCallback(
      (tagName: string) => {
        if (SELF_CLOSING_TAG.includes(tagName)) {
          setDisabled(true);
          setNodeType(NodeType.SINGLE);
        }
        setTagName(tagName);
        status && setStatus('');
      },
      [status]
    );

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

    const callback = useCallback(
      ({ value, leaf, type }: CreateNodeResult) => {
        onChange?.({ value, leaf, type });
        handleCancel();
      },
      [onChange, handleCancel]
    );

    const handleCreate = useCallback(() => {
      if (nodeType === NodeType.TEXT) {
        callback({ value: text, leaf: true, type: NodeType.TEXT });
        return;
      }
      if (hasError(tagName === '', '请选择标签')) return;
      const leaf = nodeType === NodeType.SINGLE;
      if (hasError(!leaf && SELF_CLOSING_TAG.includes(tagName), '自闭合元素不能作为容器节点'))
        return;
      callback({ value: tagName, leaf, type: nodeType });
    }, [text, tagName, nodeType, hasError, callback]);

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
        onOk={handleCreate}
        onCancel={handleCancel}
        {...{ open, title }}>
        <p style={{ marginBottom: 12, color: '#00000073' }}>
          <InfoCircleOutlined /> 提供常用的HTML标签, 请合理选择
        </p>
        {nodeType === NodeType.TEXT ? (
          <TextArea
            placeholder='输入文本内容...'
            rows={2}
            style={{ marginBottom: 12 }}
            onChange={e => setText(e.target.value)}
          />
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
        <Radio.Group value={nodeType} onChange={e => setNodeType(e.target.value)}>
          <Radio value={NodeType.CONTAINER} {...{ disabled }}>
            <Tooltip title='允许在此节点下嵌套子节点'>容器节点</Tooltip>
          </Radio>
          <Radio value={NodeType.SINGLE}>
            <Tooltip title='无法嵌套除了文本外的节点'>单独节点</Tooltip>
          </Radio>
          <Radio value={NodeType.TEXT} disabled={disabled || hiddenTextType}>
            <Tooltip title='添加一段文本内容'>文本节点</Tooltip>
          </Radio>
        </Radio.Group>
      </Modal>
    );
  }
);

export { ModalCreateNode };
