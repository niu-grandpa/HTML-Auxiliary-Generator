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
  Tooltip,
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
import { __defaultValues } from '../../components/ModalFormOfNode';
import { FormOfNodeValues } from '../../components/ModalFormOfNode/ModalFormOfNodeItem';
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

    const [nodeInitValues, setNodeInitValues] =
      useState<FormOfNodeValues>(__defaultValues);
    const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });

    const [copyNode, setCopyNode] = useState<TreeDataNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<TreeDataNode | null>(null);

    const [isEdit, setIsEdit] = useState(false);
    const [disPaste, setDisPaste] = useState(true);
    const [openDrawer, setOpenDrawer] = useState(true);
    const [openCtxMenu, setOpenCtxMenu] = useState(false);
    const [openModalForm, setOpenModalForm] = useState(false);

    useEffect(() => {
      onChange(treeData, selectedKeys);
    }, [treeData, onChange, selectedKeys]);

    useEffect(() => {
      setDisPaste(isEqual(copyNode, null));
    }, [copyNode]);

    useEffect(() => {
      if (selectedNode !== null) {
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

    const initState = useCallback(() => {
      isEdit && setIsEdit(false);
    }, [isEdit]);

    const handleOpenMdl = useCallback(
      (type?: NodeType) => {
        setNodeInitValues(v => {
          v!.type = !isEqual(type, undefined) ? type! : NodeType.CONTAINER;
          return v;
        });
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

    // 添加节点附带的额外文本内容
    const processNodeContent = useCallback(
      (node: TreeDataNode, type: NodeType, content: string) => {
        if (type === NodeType.TEXT || !content) return node;
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
        const { type, value, alias, className, identity, attributes, content } =
          values;
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
        return updateAntTree(root, processNodeContent(node, type, content));
      },
      [processNodeContent]
    );

    const updateNode = useCallback(
      (
        root: TreeDataNode[],
        values: FormOfNodeValues,
        target: TreeDataNode
      ) => {
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
      setCtxMenuPosi({ x: clientX, y: clientY + 10 });
    }, []);

    const crea = useCallback((type: NodeType) => {
      setOpenModalForm(true);
      setNodeInitValues(v => {
        v!.type = type;
        return v;
      });
    }, []);

    const handleCtxItemClick = useCallback(
      (value: CTX_MENU_OPTS) => {
        switch (value) {
          case CTX_MENU_OPTS.NEW_NON_LEAF:
            crea(NodeType.CONTAINER);
            break;
          case CTX_MENU_OPTS.ADD_TEXT:
            crea(NodeType.TEXT);
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
        crea,
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
        let { repeat, content, type } = values;
        let newData: TreeDataNode[] = cloneDeep(treeData);
        while (repeat--) {
          // 没有选中任何节点进行创建，说明是要创建根节点
          if (!target) {
            const node = processNodeContent(createNode(values), type, content);
            newData.push(node);
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
        processNodeContent,
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
              <Tooltip title='新建文本内容'>
                <Button
                  onClick={() => handleOpenMdl(NodeType.TEXT)}
                  size='small'
                  ghost
                  icon={<FileAddOutlined />}
                />
              </Tooltip>
            </Col>
            <Col span={3}>
              <Tooltip title='新建容器'>
                <Button
                  onClick={() => handleOpenMdl(NodeType.CONTAINER)}
                  size='small'
                  ghost
                  icon={<FolderAddOutlined />}
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
                nodeType={nodeInitValues.type}
                {...{ ...ctxMenuPosi, disPaste }}
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
