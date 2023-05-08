import { FolderAddOutlined, ReloadOutlined } from '@ant-design/icons';
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
import { cloneDeep, eq, gte, isNull, isUndefined } from 'lodash-es';
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
import { LazyLoading } from '../../../components';
import {
  ContextMenu,
  ContextMenuHandlers,
} from '../../../components/ContextMenu';
import core from '../../../core';
import { ProcessTreeDataNode } from '../../../core/type';
import { useCreateNodeModel, useTreeDataModel } from '../../../model';
import { StyleFormValueType } from './StyleForm';

type Props = {
  fieldNames: Partial<{ title: string; key: string; children: string }>;
};

const { confirm } = Modal;
const StyleForm = lazy(() => import('./StyleForm'));

const { updateAntTree, deleteNode, resolveKeyConflicts } = core;

const DirectoryTree: FC<Props> = memo(({ fieldNames }) => {
  const { selectedNodeInfo, saveSelectedNode } = useTreeDataModel(state => ({
    selectedNodeInfo: state.selectedNode,
    saveSelectedNode: state.saveSelectedNode,
  }));

  const { nodeData, openCreateModal, updateNodeData } = useCreateNodeModel(
    state => ({
      nodeData: state.nodeData,
      openCreateModal: state.openModal,
      updateNodeData: state.updateNodeData,
    })
  );

  const [copyNode, setCopyNode] = useState<ProcessTreeDataNode>();
  const [selected, setSelected] = useState<ProcessTreeDataNode>();
  const [nodeStyleVals, setNodeStyleVals] = useState<StyleFormValueType>({});
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  const canPaste = useMemo(() => !isUndefined(copyNode), [copyNode]);

  useEffect(() => {
    setTreeData(nodeData as TreeDataNode[]);
  }, [nodeData]);

  useEffect(() => {
    setSelectedKeys([selectedNodeInfo.key]);
  }, [selectedNodeInfo]);

  useEffect(() => {
    setSelected(selectedNodeInfo.node || undefined);
  }, [selectedNodeInfo]);

  useEffect(() => {
    if (!isNull(selected) && !isUndefined(selected)) {
      setNodeStyleVals(selected.props!.style);
    }
  }, [selected]);

  const onClearSelectedNode = useCallback(() => {
    setSelected(undefined);
    saveSelectedNode({ key: '', node: undefined });
  }, [saveSelectedNode]);

  const handleResetSelected = useCallback(() => {
    setSelectedKeys([]);
    onClearSelectedNode();
    setNodeStyleVals({});
  }, [onClearSelectedNode]);

  const handleOpenMdl = useCallback(
    (edit = false, addText = false) => {
      setSelected(selected);
      openCreateModal(selected, edit, addText);
    },
    [selected, openCreateModal]
  );

  const onCopyNode = useCallback(
    (source: TreeDataNode) => {
      setCopyNode(cloneDeep(source) as ProcessTreeDataNode);
      onClearSelectedNode();
    },
    [onClearSelectedNode]
  );

  const onDeleteNode = useCallback(
    (source: ProcessTreeDataNode, warn = true, restCopy = true) => {
      const onDelete = () => {
        updateNodeData(
          deleteNode(treeData.slice() as ProcessTreeDataNode[], source)
        );
        restCopy && onClearSelectedNode();
      };
      if (eq(warn, true) && gte(source.children?.length, 3)) {
        confirm({
          title: '注意',
          content: '当前节点下包含多个子节点, 确定要删除吗?',
          onOk() {
            onDelete();
            message.success('删除成功');
          },
        });
      } else {
        onDelete();
      }
    },
    [treeData, onClearSelectedNode, updateNodeData]
  );

  const onCutNode = useCallback(
    (source: ProcessTreeDataNode) => {
      if (eq(treeData.length, 1)) {
        message.info('根节点数量至少需要2个');
        onClearSelectedNode();
        return;
      }
      onCopyNode(source);
      onDeleteNode(source, false, false);
    },
    [treeData, onClearSelectedNode, onDeleteNode, onCopyNode]
  );

  const onPasteNode = useCallback(
    (target: ProcessTreeDataNode, source?: ProcessTreeDataNode) => {
      if (!isUndefined(source)) {
        const s = cloneDeep(source);
        const t = cloneDeep(target);
        resolveKeyConflicts(t)!;
        s.children?.push(t);
        updateNodeData(
          updateAntTree(treeData as ProcessTreeDataNode[], s).slice()
        );
        onClearSelectedNode();
      } else {
        updateNodeData([...treeData, target] as ProcessTreeDataNode[]);
      }
    },
    [onClearSelectedNode, treeData, updateNodeData]
  );

  const handleClickNode = useCallback((keys: Key[], info: any) => {
    setSelectedKeys(keys);
    setSelected(info.selectedNodes[0]);
  }, []);

  const handleRightClick = useCallback(({ node }: any) => {
    setSelected(node);
    setOpenCtxMenu(true);
  }, []);

  const ctxMenuHandlers = useMemo<ContextMenuHandlers>(
    () => ({
      onCreate: handleOpenMdl,
      onContent: () => handleOpenMdl(false, true),
      onCopy: () => onCopyNode(selected!),
      onCut: () => onCutNode(selected!),
      onPaste: () => onPasteNode(copyNode! as ProcessTreeDataNode, selected!),
      onEdit: () => handleOpenMdl(true),
      onDelete: () => onDeleteNode(selected!),
    }),
    [
      copyNode,
      onCopyNode,
      onCutNode,
      onDeleteNode,
      onPasteNode,
      selected,
      handleOpenMdl,
    ]
  );

  const handleEditStyle = useCallback(
    (values: StyleFormValueType) => {
      const cur = selected || selectedNodeInfo.node;
      if (!cur) {
        message.info('请先选择一个节点');
        setNodeStyleVals({});
        return;
      }
      const c = cloneDeep(cur);
      const oldStyle = c.props!.style;
      c.props!.style = { ...oldStyle, ...values };
      updateNodeData(
        updateAntTree(treeData.slice() as ProcessTreeDataNode[], c).slice()
      );
    },
    [selected, treeData, updateNodeData, selectedNodeInfo]
  );

  const tabsItems: TabsProps['items'] = useMemo(
    () => [
      {
        label: '节点树',
        key: 'structure',
        children: (
          <Tree
            showIcon
            showLine
            blockNode
            autoExpandParent
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
      <ContextMenu
        open={openCtxMenu}
        canPaste={canPaste}
        target={selected}
        handler={ctxMenuHandlers}
        onClose={() => setOpenCtxMenu(false)}>
        <section className='file-list' onContextMenu={e => e.preventDefault()}>
          <Row>
            <Col style={{ fontSize: 13 }} span={18}>
              结构管理器
            </Col>
            <Col span={3}>
              <Tooltip title='新建元素'>
                <Button
                  onClick={() => handleOpenMdl()}
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
