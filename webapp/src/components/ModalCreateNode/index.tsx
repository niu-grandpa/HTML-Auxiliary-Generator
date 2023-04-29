import { Button, Modal, Space } from 'antd';
import { useCallback, useMemo } from 'react';
import { NodeType } from '../../core/type';
import { useCreateNodeModel } from '../../model';
import {
  ModalFormOfNodeItem,
  type FormOfNodeValues,
} from './ModalFormOfNodeItem';

export const __defaultValues: FormOfNodeValues = {
  value: '',
  leaf: false,
  type: NodeType.CONTAINER,
  repeat: 1,
  alias: '',
  content: '',
  className: '',
  identity: '',
  attributes: [],
};

export const ModalCreateNode = () => {
  const { open, edit, target, addText, createNode, closeModal } =
    useCreateNodeModel(state => ({
      open: state.open,
      edit: state.edit,
      addText: state.addText,
      target: state.target,
      createNode: state.createNode,
      closeModal: state.closeModal,
    }));

  const _open = useMemo(() => open, [open]);

  const initValues = useMemo<FormOfNodeValues>(() => {
    if (!target) return __defaultValues;
    const { type, title, isLeaf, alias, props, content } = target;
    const { id, className, attributes } = props!;
    return {
      alias,
      content,
      repeat: 1,
      attributes,
      identity: id!,
      leaf: isLeaf!,
      value: `${title}`,
      className: className!,
      type: addText ? NodeType.TEXT : type,
    };
  }, [target, addText]);

  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleFinish = useCallback(
    (data: FormOfNodeValues) => {
      data.leaf = data.type !== NodeType.CONTAINER;
      createNode(data);
      handleCancel();
    },
    [handleCancel, createNode]
  );

  return (
    <Modal
      open={_open}
      mask={false}
      footer={null}
      onCancel={handleCancel}
      title={edit ? '编辑节点' : '新建节点'}>
      <ModalFormOfNodeItem
        {...{ edit, initValues }}
        onFinish={handleFinish}
        trigger={
          <Space style={{ display: 'flex', justifyContent: 'end' }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type='primary' htmlType='submit'>
              确定
            </Button>
          </Space>
        }
      />
    </Modal>
  );
};
