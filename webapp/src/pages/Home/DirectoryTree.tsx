import {
  BuildOutlined,
  CodepenOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Modal,
  Row,
  Tooltip,
  Tree,
  message,
  type TreeDataNode,
} from 'antd';
import {
  clone,
  cloneDeep,
  head,
  isEqual,
  isNull,
  isUndefined,
} from 'lodash-es';
import {
  FC,
  Key,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DrawerStyleSettings, ModalFormOfNode } from '../../components';
import { ContextMenu } from '../../components/ContextMenu';
import { StyleFormValues } from '../../components/DrawerStyleSettings';
import { __defaultValues } from '../../components/ModalFormOfNode';
import { FormOfNodeValues } from '../../components/ModalFormOfNode/ModalFormOfNodeItem';
import core from '../../core';
import { NodeType } from '../../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';
import { useTreeDataModel } from '../../model';

type Props = {
  fieldNames: Partial<{ title: string; key: string; children: string }>;
};

const { createAntTreeNode, updateAntTree, deleteNode, resolveKeyConflicts } =
  core;
const { confirm } = Modal;

const nodeIcons = {
  0: <CodepenOutlined />,
  1: <BuildOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = memo(({ fieldNames }) => {
  const {
    selectedKey,
    saveTreeData,
    needPushNode,
    noticePushNode,
    needUpdateNode,
    needDeleteNode,
    noticeDeleteNode,
  } = useTreeDataModel(state => ({
    selectedKey: state.selectedKey,
    saveTreeData: state.saveTreeData,
    needPushNode: state.newNode,
    noticePushNode: state.push,
    needDeleteNode: state.deleteNode,
    needUpdateNode: state.node,
    noticeDeleteNode: state.delete,
  }));

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const [nodeInitValues, setNodeInitValues] =
    useState<FormOfNodeValues>(__defaultValues);
  const [nodeInitStyle, setNodeInitStyle] = useState<StyleFormValues>();

  const [copyNode, setCopyNode] = useState<TreeDataNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeDataNode | null>(null);

  const [isEdit, setIsEdit] = useState(false);

  const disPaste = useMemo(() => isNull(copyNode), [copyNode]);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [openModalForm, setOpenModalForm] = useState(false);

  useEffect(() => {
    if (needUpdateNode) {
      setTreeData(updateAntTree(treeData, needUpdateNode!));
    }
  }, [treeData, needUpdateNode]);

  useEffect(() => {
    setSelectedKeys([selectedKey]);
  }, [selectedKey]);

  useEffect(() => {
    saveTreeData(clone(treeData));
  }, [treeData, saveTreeData]);

  useEffect(() => {
    if (!isNull(selectedNode) && !isUndefined(selectedNode)) {
      // @ts-ignore
      const { type, title, isLeaf, alias, props, content } = selectedNode;
      const { id, className, attributes } = props;
      setNodeInitValues({
        type,
        content,
        value: `${title}`,
        leaf: isLeaf!,
        alias,
        repeat: 1,
        identity: id,
        className,
        attributes,
      });
    }
  }, [selectedNode]);

  useEffect(() => {
    const closeContextMenu = (e: Event) => {
      e.stopPropagation();
      setOpenCtxMenu(false);
    };
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('click', closeContextMenu);
    };
  }, []);

  const resetIsEdit = useCallback(() => {
    isEdit && setIsEdit(false);
  }, [isEdit]);

  const onClearSelectedNode = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleResetSelected = useCallback(() => {
    setSelectedKeys([]);
    onClearSelectedNode();
  }, [onClearSelectedNode]);

  const handleOpenMdl = useCallback(
    (type?: NodeType) => {
      setNodeInitValues(v => {
        v!.type = !isUndefined(type) ? type! : NodeType.CONTAINER;
        return v;
      });
      setOpenModalForm(true);
      setSelectedNode(selectedNode);
    },
    [selectedNode]
  );

  const handleCloseModal = useCallback(() => {
    resetIsEdit();
    setOpenModalForm(false);
  }, [resetIsEdit]);

  const createNode = useCallback((values: FormOfNodeValues) => {
    const node = createAntTreeNode(values);
    node.icon = nodeIcons[values.type];
    return node;
  }, []);

  // 添加节点附带的额外文本内容
  const processNodeContent = useCallback(
    (node: TreeDataNode, type: NodeType, content: string) => {
      if (isEqual(type, NodeType.TEXT) || !content) return node;
      const textNode = createNode({
        ...__defaultValues,
        type: NodeType.TEXT,
        leaf: true,
        content,
      });
      node.children?.push(textNode);
      return node;
    },
    [createNode]
  );

  const editNode = useCallback(
    (root: TreeDataNode[], node: TreeDataNode, values: FormOfNodeValues) => {
      const { value, alias, className, identity, attributes, content } = values;
      node.title = value;
      // @ts-ignore
      node.content = content;
      // @ts-ignore
      node.alias = alias || value || content;
      // @ts-ignore
      node.props = {
        id: identity,
        className,
        attributes,
      };
      return updateAntTree(root, node);
    },
    []
  );

  const updateNode = useCallback(
    (root: TreeDataNode[], values: FormOfNodeValues, target: TreeDataNode) => {
      const { value: tag, content, type } = values;
      // 1.修改节点标签
      if (isEqual(isEdit, true)) {
        if (target.children?.length && SELF_CLOSING_TAG.includes(tag)) {
          confirm({
            title: '警告',
            content: '自闭合元素不能作为容器，会清空该节点下的子节点',
            onOk() {
              target.children!.length = 0;
              return editNode(root, target, values);
            },
          });
        } else {
          return editNode(root, target, values);
        }
      }
      // 2.新增节点
      const n = processNodeContent(createNode(values), type, content);
      target!.children?.push(n);
      return updateAntTree(root, target);
    },
    [isEdit, editNode, createNode, processNodeContent]
  );

  const onCopyNode = useCallback(
    (source: TreeDataNode) => {
      setCopyNode(cloneDeep(source));
      onClearSelectedNode();
    },
    [onClearSelectedNode]
  );

  const onDeleteNode = useCallback(
    (source: TreeDataNode, showConfirm = true) => {
      const onDelete = () => {
        setTreeData(deleteNode(cloneDeep(treeData), cloneDeep(source)!));
        onClearSelectedNode();
      };
      if (isEqual(showConfirm, false)) {
        onDelete();
        return;
      }
      confirm({
        title: '警告',
        content: '确定要删除该节点吗?',
        onOk() {
          onDelete();
          message.success('删除成功');
        },
      });
    },
    [treeData, onClearSelectedNode]
  );

  const onCutNode = useCallback(
    (source: TreeDataNode) => {
      if (isEqual(treeData.length, 1) && isEqual(head(treeData), source)) {
        message.info('根节点数量小于2, 不能进行剪切');
        onClearSelectedNode();
        return;
      }
      onCopyNode(source);
      onDeleteNode(source, false);
    },
    [treeData, onClearSelectedNode, onDeleteNode, onCopyNode]
  );

  const onPasteNode = useCallback(
    (target: TreeDataNode, source?: TreeDataNode) => {
      if (!isUndefined(source)) {
        source.children?.push(cloneDeep(resolveKeyConflicts(target))!);
        onClearSelectedNode();
        setTreeData(updateAntTree(cloneDeep(treeData), cloneDeep(source)));
      } else {
        setTreeData([...treeData, target]);
      }
    },
    [onClearSelectedNode, treeData]
  );

  const handleClickNode = useCallback((keys: Key[], info: any) => {
    setSelectedKeys(keys);
    setSelectedNode(info.selectedNodes[0]);
  }, []);

  const handleRightClick = useCallback(({ node }: any) => {
    setSelectedNode(node);
    setOpenCtxMenu(true);
  }, []);

  const crea = useCallback((type: NodeType) => {
    setOpenModalForm(true);
    setNodeInitValues(v => {
      v!.type = type;
      return v;
    });
  }, []);

  const ctxMenuMethods = useCallback(
    (key: string) => {
      const methods = {
        '1': () => crea(NodeType.CONTAINER),
        '2': () => crea(NodeType.TEXT),
        '3': () => {
          // @ts-ignore
          setNodeInitStyle(selectedNode['props']['style']);
          setOpenDrawer(true);
        },
        '4': () => onCopyNode(selectedNode!),
        '5': () => onCutNode(selectedNode!),
        '6': () => onPasteNode(copyNode!, selectedNode!),
        '7': () => {
          setOpenModalForm(true);
          setIsEdit(true);
        },
        '8': () => onDeleteNode(selectedNode!),
      };
      // @ts-ignore
      methods[key]();
    },
    [
      copyNode,
      crea,
      onCopyNode,
      onCutNode,
      onDeleteNode,
      onPasteNode,
      selectedNode,
    ]
  );

  const handleCtxItemClick = useCallback(
    ({ key }: { key: string }) => {
      ctxMenuMethods(key);
      setOpenCtxMenu(false);
    },
    [ctxMenuMethods]
  );

  const invokeCallback = useCallback(
    (node: TreeDataNode) => {
      const newData = updateAntTree(treeData, node);
      setTreeData(newData);
      saveTreeData(newData);
    },
    [saveTreeData, treeData]
  );

  const handleEditStyle = useCallback(
    (style: StyleFormValues) => {
      const n = cloneDeep(selectedNode)!;
      // @ts-ignore
      n.props.style = { ...n.props.style, ...style };
      invokeCallback(n);
    },
    [selectedNode, invokeCallback]
  );

  const handleFinish = useCallback(
    (values: FormOfNodeValues) => {
      const target = cloneDeep(selectedNode)!;
      let { repeat, content, type } = values;
      let newData: TreeDataNode[] = cloneDeep(treeData);
      while (repeat--) {
        // 没有选中任何节点进行创建，说明是要创建根节点
        if (!target) {
          onPasteNode(processNodeContent(createNode(values), type, content));
          continue;
        }
        setTreeData(updateNode(newData, values, target)!);
      }
      resetIsEdit();
      onClearSelectedNode();
    },
    [
      treeData,
      onPasteNode,
      selectedNode,
      createNode,
      updateNode,
      resetIsEdit,
      processNodeContent,
      onClearSelectedNode,
    ]
  );

  useEffect(() => {
    if (needDeleteNode) {
      onDeleteNode(needDeleteNode!, false);
      noticeDeleteNode(null);
    }
  }, [needDeleteNode, onDeleteNode, noticeDeleteNode]);

  useEffect(() => {
    if (needPushNode) {
      onPasteNode(needPushNode);
      noticePushNode(null);
    }
  }, [treeData, needPushNode, onPasteNode, noticePushNode]);

  return (
    <>
      <ModalFormOfNode
        edit={isEdit}
        open={openModalForm}
        onCancel={handleCloseModal}
        defaultValues={nodeInitValues}
        onValuesChange={handleFinish}
      />
      <ContextMenu
        open={openCtxMenu}
        {...{ disPaste }}
        onClick={handleCtxItemClick}
        nodeType={nodeInitValues.type}>
        <section className='file-list' onContextMenu={e => e.preventDefault()}>
          <Row>
            <Col style={{ fontSize: 13 }} span={18}>
              结构管理(工作区)
            </Col>
            <Col span={3}>
              <Tooltip title='新建元素'>
                <Button
                  onClick={() => handleOpenMdl(NodeType.CONTAINER)}
                  size='small'
                  ghost
                  icon={<FolderAddOutlined />}
                />
              </Tooltip>
            </Col>
            <Col span={3}>
              <Tooltip title='重置选中的节点'>
                <Button
                  onClick={handleResetSelected}
                  size='small'
                  ghost
                  icon={<ReloadOutlined />}
                />
              </Tooltip>
            </Col>
          </Row>
          <hr style={{ marginTop: 10, marginBottom: 16 }} />
          {!treeData.length ? (
            <>
              <p style={{ marginBottom: 18 }}>尚未新建任何节点。</p>
              <Button type='primary' block onClick={() => handleOpenMdl()}>
                新建
              </Button>
            </>
          ) : (
            <>
              <Tree
                showIcon
                showLine
                blockNode
                defaultExpandAll
                {...{ treeData, fieldNames, selectedKeys }}
                draggable={{ icon: false }}
                onSelect={handleClickNode}
                onRightClick={handleRightClick}
              />
            </>
          )}
        </section>
      </ContextMenu>
      <DrawerStyleSettings
        open={openDrawer}
        initialValues={nodeInitStyle}
        onChange={handleEditStyle}
        onClose={() => setOpenDrawer(false)}
      />
    </>
  );
});

export default DirectoryTree;
