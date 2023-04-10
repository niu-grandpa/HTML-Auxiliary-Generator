import {
  CodepenOutlined,
  CoffeeOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Modal,
  Row,
  Tabs,
  TabsProps,
  Tooltip,
  Tree,
  message,
  type TreeDataNode,
} from 'antd';
import { cloneDeep, isEqual, isNull, isUndefined } from 'lodash-es';
import {
  FC,
  Key,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LazyLoading, ModalFormOfNode } from '../../../components';
import { ContextMenu } from '../../../components/ContextMenu';
import { __defaultValues } from '../../../components/ModalFormOfNode';
import { FormOfNodeValues } from '../../../components/ModalFormOfNode/ModalFormOfNodeItem';
import core from '../../../core';
import { NodeType } from '../../../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../../../core/runtime-transform';
import { useTreeDataModel } from '../../../model';
import { StyleFormValueType } from './StyleForm';

type Props = {
  fieldNames: Partial<{ title: string; key: string; children: string }>;
};

const StyleForm = lazy(() => import('./StyleForm'));
const { confirm } = Modal;

const { createAntTreeNode, updateAntTree, deleteNode, resolveKeyConflicts } =
  core;

const nodeIcons = {
  0: <CodepenOutlined />,
  1: <CoffeeOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = memo(({ fieldNames }) => {
  const {
    saveTreeData,
    needPushNode,
    selectedNodeInfo,
    noticePushNode,
    noticeUpdateNode,
    needUpdateNode,
    needDeleteNode,
    noticeDeleteNode,
  } = useTreeDataModel(state => ({
    selectedNodeInfo: state.selectedNode,
    saveTreeData: state.saveTreeData,
    needPushNode: state.newNode,
    noticePushNode: state.push,
    noticeUpdateNode: state.update,
    needDeleteNode: state.deleteNode,
    needUpdateNode: state.node,
    noticeDeleteNode: state.delete,
  }));

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const [nodeInitVals, setNodeInitVals] =
    useState<FormOfNodeValues>(__defaultValues);
  const [nodeStyleVals, setNodeStyleVals] = useState<StyleFormValueType>({});

  const [copyNode, setCopyNode] = useState<TreeDataNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeDataNode | null>(null);

  const [isEdit, setIsEdit] = useState(false);

  const disPaste = useMemo(() => isNull(copyNode), [copyNode]);

  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [openModalForm, setOpenModalForm] = useState(false);

  useEffect(() => {
    setSelectedKeys([selectedNodeInfo.key]);
  }, [selectedNodeInfo]);

  useEffect(() => {
    saveTreeData(cloneDeep(treeData));
  }, [treeData, saveTreeData]);

  useEffect(() => {
    if (selectedNodeInfo.node) setSelectedNode(selectedNodeInfo.node);
  }, [selectedNodeInfo]);

  useEffect(() => {
    if (!isNull(selectedNode) && !isUndefined(selectedNode)) {
      // @ts-ignore
      const { type, title, isLeaf, alias, props, content } = selectedNode;
      const { id, className, attributes, style } = props;
      setNodeInitVals({
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
      setNodeStyleVals(style);
    } else {
      setNodeStyleVals({});
      setNodeInitVals(__defaultValues);
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
      setNodeInitVals(v => {
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
        setTreeData(deleteNode(treeData.slice(), cloneDeep(source)!));
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
      if (isEqual(treeData.length, 1)) {
        message.info('根节点数量至少需要2个');
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
        const s = cloneDeep(source);
        const t = cloneDeep(target);
        resolveKeyConflicts(t)!;
        s.children?.push(t);
        setTreeData(updateAntTree(treeData, s).slice());
        onClearSelectedNode();
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
    setNodeInitVals(v => {
      v!.type = type;
      return v;
    });
  }, []);

  const ctxMenuMethods = useCallback(
    (key: string) => {
      const methods = {
        '1': () => crea(NodeType.CONTAINER),
        '2': () => crea(NodeType.TEXT),
        '3': () => onCopyNode(selectedNode!),
        '4': () => onCutNode(selectedNode!),
        '5': () => onPasteNode(copyNode!, selectedNode!),
        '6': () => {
          setIsEdit(true);
          setOpenModalForm(true);
        },
        '7': () => onDeleteNode(selectedNode!),
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

  const handleEditStyle = useCallback(
    (values: StyleFormValueType) => {
      if (!selectedNode) {
        message.info('请先选择节点');
        setNodeStyleVals({});
        return;
      }
      const c = cloneDeep(selectedNode);
      // @ts-ignore
      c.props.style = { ...c.props.style, ...values };
      setTreeData(updateAntTree(treeData.slice(), c).slice());
    },
    [selectedNode, treeData]
  );

  const handleFinish = useCallback(
    (values: FormOfNodeValues) => {
      const target = cloneDeep(selectedNode)!;
      let { repeat, content, type } = values;
      const newData: TreeDataNode[] = treeData.slice();
      while (repeat--) {
        // 没有选中任何节点进行创建，说明是要创建根节点
        if (!target) {
          onPasteNode(processNodeContent(createNode(values), type, content));
          continue;
        }
        setTreeData(updateNode(newData, values, target)!.slice());
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
    if (needUpdateNode) {
      setTreeData(updateAntTree(treeData.slice(), needUpdateNode!).slice());
      noticeUpdateNode(null);
    }
  }, [treeData, needUpdateNode, saveTreeData, noticeUpdateNode]);

  useEffect(() => {
    if (needDeleteNode) {
      onDeleteNode(needDeleteNode!, false);
    }
  }, [needDeleteNode, onDeleteNode, noticeDeleteNode]);

  useEffect(() => {
    if (needPushNode) {
      onPasteNode(needPushNode);
      noticePushNode(null);
    }
  }, [treeData, needPushNode, onPasteNode, noticePushNode]);

  const tabsItems: TabsProps['items'] = useMemo(
    () => [
      {
        label: '结构管理',
        key: 'structure',
        children: (
          <Tree
            showIcon
            showLine
            blockNode
            defaultExpandAll
            {...{ treeData, fieldNames, selectedKeys }}
            onSelect={handleClickNode}
            onRightClick={handleRightClick}
          />
        ),
      },
      {
        label: 'Style',
        key: 'style',
        children: (
          <LazyLoading
            fallback='loading...'
            children={
              <StyleForm
                defaultValues={nodeStyleVals}
                onValuesChange={handleEditStyle}
              />
            }
          />
        ),
      },
    ],
    [
      treeData,
      selectedKeys,
      fieldNames,
      nodeStyleVals,
      handleEditStyle,
      handleClickNode,
      handleRightClick,
    ]
  );

  return (
    <>
      <ModalFormOfNode
        edit={isEdit}
        open={openModalForm}
        onCancel={handleCloseModal}
        defaultValues={nodeInitVals}
        onValuesChange={handleFinish}
      />
      <ContextMenu
        open={openCtxMenu}
        {...{ disPaste }}
        onClick={handleCtxItemClick}
        nodeType={nodeInitVals.type}>
        <section className='file-list' onContextMenu={e => e.preventDefault()}>
          <Row>
            <Col style={{ fontSize: 13 }} span={18}>
              无标题(工作区)
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
          {!treeData.length ? (
            <>
              <hr style={{ marginBottom: 26 }} />
              <p style={{ marginBottom: 18 }}>尚未新建任何节点。</p>
              <Button type='primary' block onClick={() => handleOpenMdl()}>
                新建
              </Button>
            </>
          ) : (
            <Tabs items={tabsItems} />
          )}
        </section>
      </ContextMenu>
    </>
  );
});

export default DirectoryTree;
