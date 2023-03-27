import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { COMMON_TAGS } from '../assets';
import { NodeType } from '../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../core/runtime-transform';
import { __defaultValues } from './ModalFormOfNode';

export type FormOfNodeValues = {
  value: string;
  leaf: boolean;
  content: string;
  type: NodeType;
  repeat: number;
  alias: string;
  className: string;
  identity: string;
  attributes: { name: string; value: string }[];
};

type Props = {
  edit: boolean;
  trigger: JSX.Element;
  initialValues: FormOfNodeValues;
  onFinish: (values: FormOfNodeValues) => void;
};

/**创建或编辑节点的表单输入框 */
const ModalFormOfNodeItem: FC<Partial<Props>> = memo(
  ({ edit, trigger, onFinish, initialValues }) => {
    const [form] = useForm<FormOfNodeValues>();

    const [isTextType, setIsTextType] = useState(
      initialValues?.type === NodeType.TEXT
    );
    const [isSelfCloseTag, setIsSCTag] = useState(false);
    const [nodeType, setNodeType] = useState<NodeType>(initialValues!.type);

    useEffect(() => {
      if (!edit) {
        form.setFieldsValue({ ...__defaultValues, type: initialValues!.type });
      }
    }, [edit, form, initialValues]);

    useEffect(() => {
      if (initialValues?.value === initialValues?.alias) {
        form.setFieldsValue({ alias: '' });
      }
    }, [form, initialValues?.alias, initialValues?.value]);

    useEffect(() => {
      setIsTextType(initialValues?.type === NodeType.TEXT);
    }, [initialValues?.type]);

    useEffect(() => {
      setIsSCTag(SELF_CLOSING_TAG.includes(initialValues?.value || ''));
    }, [initialValues?.value]);

    const handleValuesChange = useCallback(
      (_: any, { value, type }: FormOfNodeValues) => {
        if (SELF_CLOSING_TAG.includes(value)) {
          setIsSCTag(true);
          setNodeType(NodeType.SINGLE);
          form.setFieldsValue({ type: NodeType.SINGLE });
        } else {
          setIsSCTag(false);
          const restType = edit ? initialValues!.type : type;
          setNodeType(restType);
          form.setFieldsValue({ type: restType });
        }
        setIsTextType(type === NodeType.TEXT);
      },

      [form, initialValues, edit]
    );

    const handleFinish = useCallback(
      (values: FormOfNodeValues) => {
        if (nodeType !== NodeType.TEXT && !values.value) {
          message.error('请选择元素');
          return;
        }
        if (nodeType === NodeType.TEXT) {
          const obj = {
            ...__defaultValues,
            // @ts-ignore
            type: values.type,
            content: values.content,
          };
          onFinish?.(obj);
        } else {
          onFinish?.(values);
        }
      },
      [onFinish, nodeType]
    );

    return (
      <Form
        name='form'
        autoComplete='off'
        {...{ form, initialValues }}
        style={{ marginTop: 24 }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}>
        {isTextType ? (
          <Form.Item label='内容' name='content' style={{ width: 455 }}>
            <Input.TextArea />
          </Form.Item>
        ) : (
          <Form.Item label='预置元素' name='value'>
            <Select
              showSearch
              allowClear
              style={{ width: '60%' }}
              placeholder='常用html标签供选择'
              optionFilterProp='children'
              filterOption={(input, option) =>
                ((option?.label ?? '') as string).includes(input)
              }
              options={COMMON_TAGS}
            />
          </Form.Item>
        )}
        <Form.Item name='type'>
          <Radio.Group value={nodeType} disabled={edit}>
            <Tooltip title='允许在此节点下嵌套子节点'>
              <Radio
                value={NodeType.CONTAINER}
                disabled={
                  initialValues?.type === NodeType.TEXT || isSelfCloseTag
                }>
                容器节点
              </Radio>
            </Tooltip>
            <Tooltip title='无法嵌套除了文本外的节点'>
              <Radio
                value={NodeType.SINGLE}
                disabled={initialValues?.type === NodeType.TEXT}>
                单独节点
              </Radio>
            </Tooltip>
            <Tooltip title='用于添加一段文本内容'>
              <Radio value={NodeType.TEXT} disabled={isSelfCloseTag}>
                文本节点
              </Radio>
            </Tooltip>
          </Radio.Group>
        </Form.Item>
        {!isTextType && (
          <>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space>
                <Form.Item label='别名' name='alias'>
                  <Input placeholder='列表显示的标签别名' />
                </Form.Item>
                <Form.Item label='数量' name='repeat'>
                  <InputNumber
                    min={1}
                    defaultValue={1}
                    disabled={edit}
                    style={{ width: 180 }}
                    placeholder='批量创建'
                  />
                </Form.Item>
              </Space>
              <Space>
                <Form.Item label='id名' name='identity'>
                  <Input placeholder='元素id' />
                </Form.Item>
                <Form.Item label='class' name='className'>
                  <Input placeholder='类名 多个请用空格分隔' />
                </Form.Item>
              </Space>
            </Form.Item>
            <Form.Item name='content'>
              <Input.TextArea placeholder='添加文本内容' />
            </Form.Item>
            <Form.List name='attributes'>
              {(fields, { add, remove }) => (
                <>
                  <Form.Item>
                    <Button block type='dashed' onClick={() => add()}>
                      <PlusOutlined /> 添加更多属性
                    </Button>
                  </Form.Item>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space align='baseline' {...{ key }}>
                      <Form.Item
                        label='属性'
                        name={[name, 'name']}
                        {...restField}>
                        <Input placeholder='属性名' />
                      </Form.Item>
                      <Form.Item
                        label='属值'
                        name={[name, 'value']}
                        {...restField}>
                        <Input placeholder='属性值' />
                      </Form.Item>
                      <Button
                        icon={<MinusCircleOutlined />}
                        type='text'
                        onClick={() => remove(name)}
                      />
                    </Space>
                  ))}
                </>
              )}
            </Form.List>
          </>
        )}
        <Form.Item style={{ marginBottom: 0 }}>{trigger}</Form.Item>
      </Form>
    );
  }
);

export { ModalFormOfNodeItem };
