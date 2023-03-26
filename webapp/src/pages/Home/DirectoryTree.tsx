import {
  BuildOutlined,
  CodeSandboxOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  message,
  Modal,
  Row,
  Tree,
  type TreeDataNode,
} from 'antd';
import { clone, cloneDeep, head, isEqual } from 'lodash-es';
import {
  FC,
  Key,
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DrawerStyleSettings, ModalFormOfNode } from '../../components';
import { ContextMenu, CTX_MENU_OPTS } from '../../components/ContextMenu';
import { FormOfNodeValues } from '../../components/ModalFormOfNodeItem';
import core from '../../core';
import { NodeType } from '../../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';

type Props = {
  selectedKey: number;
  onChange: (node: TreeDataNode[], selectedKey: Key[]) => void;
  fieldNames: Partial<{ title: string; key: string; children: string }>;
};

const { createAntTreeNode, updateAntTree, deleteNode, resolveKeyConflicts } =
  core;
const { confirm } = Modal;

const nodeIcons = {
  0: <CodeSandboxOutlined />,
  1: <BuildOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = memo(
  ({ fieldNames, selectedKey, onChange }) => {
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

    const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });

    const [copyNode, setCopyNode] = useState<TreeDataNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<TreeDataNode | null>(null);
    const [nodeInitValues, setNodeInitValues] = useState<FormOfNodeValues>();

    const [isLeaf, setIsLeaf] = useState(false);
    const [isText, setIsText] = useState(false);
    const [disPaste, setDisPaste] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openCtxMenu, setOpenCtxMenu] = useState(false);
    const [openModalForm, setOpenModalForm] = useState(false);

    useEffect(() => {
      onChange(treeData, selectedKeys);
    }, [treeData, onChange, selectedKeys]);

    useEffect(() => {
      if (!copyNode || isLeaf) setDisPaste(true);
      else setDisPaste(false);
    }, [copyNode, isLeaf]);

    useEffect(() => {
      if (selectedNode !== null) {
        // @ts-ignore
        const { type, title, isLeaf, alias, props } = selectedNode;
        const { id, className, attributes } = props;
        setNodeInitValues({
          type,
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

    const initState = useCallback(() => {
      isText && setIsText(false);
      isLeaf && setIsLeaf(false);
      isEdit && setIsEdit(false);
      copyNode && setCopyNode(null);
    }, [isText, isEdit, isLeaf, copyNode]);

    const handleOpenMdl = useCallback(
      (leaf?: boolean) => {
        if (!isEqual(leaf, undefined)) {
          setIsLeaf(leaf!);
        }
        setOpenModalForm(true);
        setSelectedNode(selectedNode);
      },
      [selectedNode]
    );

    const handleCloseModal = useCallback(() => {
      initState();
      setOpenModalForm(false);
    }, [initState]);

    const createNode = useCallback((values: FormOfNodeValues) => {
      // todo 样式
      const node = createAntTreeNode(values);
      node.icon = nodeIcons[values.type];
      return node;
    }, []);

    const editNode = useCallback(
      (
        root: TreeDataNode[],
        node: TreeDataNode,
        { value, alias, className, identity, attributes }: FormOfNodeValues
      ) => {
        node.title = value;
        // @ts-ignore
        node.alias = alias || value;
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
      (
        root: TreeDataNode[],
        values: FormOfNodeValues,
        target: TreeDataNode
      ) => {
        const { value: tag } = values;
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
        target!.children?.push(createNode(values));
        return updateAntTree(root, target);
      },
      [isEdit, editNode, createNode]
    );

    const onClearSelectedNode = useCallback(() => {
      setSelectedNode(null);
    }, []);

    const onSetStyle = useCallback(() => {
      setOpenDrawer(true);
    }, []);

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
      (target: TreeDataNode, source: TreeDataNode) => {
        resolveKeyConflicts(target);
        source.children?.push(target);
        onClearSelectedNode();
        setTreeData(updateAntTree(clone(treeData), source));
      },
      [onClearSelectedNode, treeData]
    );

    const handleClickNode = useCallback((keys: Key[], info: any) => {
      setSelectedKeys(keys);
      setSelectedNode(info.selectedNodes[0]);
    }, []);

    const handleRightClick = useCallback((info: any) => {
      const { event, node } = info;
      const { clientX, clientY } = event as MouseEvent;
      setSelectedNode(node);
      setOpenCtxMenu(true);
      setIsLeaf(node.isLeaf);
      setIsText(isEqual(node.type, NodeType.TEXT));
      setCtxMenuPosi({ x: clientX, y: clientY + 10 });
    }, []);

    const handleCtxItemClick = useCallback(
      (value: CTX_MENU_OPTS) => {
        switch (value) {
          case CTX_MENU_OPTS.NEW_LEAF:
            setOpenModalForm(true);
            break;
          case CTX_MENU_OPTS.NEW_NON_LEAF:
            setOpenModalForm(true);
            break;
          case CTX_MENU_OPTS.ADD_TEXT:
            setOpenModalForm(true);
            break;
          case CTX_MENU_OPTS.SET_STYLE:
            onSetStyle();
            break;
          case CTX_MENU_OPTS.COPY:
            onCopyNode(selectedNode!);
            break;
          case CTX_MENU_OPTS.CUT:
            onCutNode(selectedNode!);
            break;
          case CTX_MENU_OPTS.PASTE:
            onPasteNode(copyNode!, selectedNode!);
            break;
          case CTX_MENU_OPTS.EDIT_TAG:
            setOpenModalForm(true);
            setIsEdit(true);
            break;
          case CTX_MENU_OPTS.REMOVE:
            onDeleteNode(selectedNode!);
            break;
        }
        setOpenCtxMenu(false);
      },
      [
        copyNode,
        selectedNode,
        onCopyNode,
        onCutNode,
        onDeleteNode,
        onPasteNode,
        onSetStyle,
      ]
    );

    const handleFinish = useCallback(
      (values: FormOfNodeValues) => {
        const target = cloneDeep(selectedNode)!;
        let { repeat } = values;
        let newData: TreeDataNode[] = cloneDeep(treeData);
        while (repeat--) {
          // 没有选中任何节点进行创建，说明是要创建根节点
          if (!target) {
            newData.push(createNode(values));
            continue;
          }
          newData = updateNode(newData, values, target)!;
        }
        setTreeData(newData);
        initState();
        onClearSelectedNode();
      },
      [
        treeData,
        selectedNode,
        createNode,
        updateNode,
        initState,
        onClearSelectedNode,
      ]
    );

    return (
      <>
        <ModalFormOfNode
          edit={isEdit}
          open={openModalForm}
          onCancel={handleCloseModal}
          defaultValues={nodeInitValues}
          onValuesChange={handleFinish}
        />
        <section className='file-list' onContextMenu={e => e.preventDefault()}>
          <Row>
            <Col style={{ fontSize: 13 }} span={18}>
              结构管理(工作区)
            </Col>
            <Col span={3}>
              <Button
                onClick={() => handleOpenMdl(true)}
                size='small'
                ghost
                icon={<FileAddOutlined />}
              />
            </Col>
            <Col span={3}>
              <Button
                onClick={() => handleOpenMdl(false)}
                size='small'
                ghost
                icon={<FolderAddOutlined />}
              />
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
                blockNode
                defaultExpandAll
                {...{ treeData, fieldNames }}
                draggable={{ icon: false }}
                onSelect={handleClickNode}
                selectedKeys={[selectedKey]}
                onRightClick={handleRightClick}
              />
              <ContextMenu
                open={openCtxMenu}
                onClose={onClearSelectedNode}
                onClick={handleCtxItemClick}
                {...{ ...ctxMenuPosi, isLeaf, isText, disPaste }}
              />
              <DrawerStyleSettings
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
              />
            </>
          )}
        </section>
      </>
    );
  }
);

export default DirectoryTree;
