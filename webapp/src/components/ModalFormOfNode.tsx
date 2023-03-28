import { Button, Modal, Space } from 'antd';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { NodeType } from '../core/runtime-generate';
import {
  ModalFormOfNodeItem,
  type FormOfNodeValues,
} from './ModalFormOfNodeItem';

type Props = {
  edit: boolean;
  open: boolean;
  onCancel: () => void;
  defaultValues: FormOfNodeValues;
  onValuesChange: (values: FormOfNodeValues) => void;
};

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

const ModalFormOfNode: FC<Partial<Props>> = memo(
  ({ defaultValues, edit, open, onCancel, onValuesChange }) => {
    const [initialValues, setInitialValues] =
      useState<FormOfNodeValues>(__defaultValues);

    useEffect(() => {
      if (defaultValues) {
        setInitialValues(defaultValues);
      }
    }, [defaultValues]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      setInitialValues(__defaultValues);
    }, [onCancel]);

    const handleFinish = useCallback(
      (values: FormOfNodeValues) => {
        values.leaf = values.type !== NodeType.CONTAINER;
        onValuesChange?.(values);
        handleCancel();
      },
      [handleCancel, onValuesChange]
    );

    return (
      <Modal
        {...{ open, onCancel }}
        mask={false}
        footer={null}
        title={edit ? '编辑节点' : '创建节点'}>
        <ModalFormOfNodeItem
          {...{ edit, initialValues }}
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
  }
);

export { ModalFormOfNode };
