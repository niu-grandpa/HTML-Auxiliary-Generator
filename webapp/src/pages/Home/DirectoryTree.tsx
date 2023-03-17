import {
  BuildOutlined,
  CodeSandboxOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tree, type TreeDataNode } from 'antd';
import { clone, cloneDeep, head, isEqual } from 'lodash-es';
import { FC, Key, memo, MouseEvent, useCallback, useEffect, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu, CTX_MENU_OPTS } from '../../components/ContextMenu';
import { type CreateNodeResult } from '../../components/ModalCreateNode';
import core from '../../core';
import { NodeType } from '../../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';

type Props = {
  selectedKey: number;
  onChange: (node: TreeDataNode[]) => void;
  fieldNames: Partial<{ title: string; key: string; children: string }>;
};

const { createAntTreeNode, updateAntTree, deleteNode, resolveKeyConflicts } = core;
const { confirm } = Modal;

const nodeIcons = {
  0: <CodeSandboxOutlined />,
  1: <BuildOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = ({ fieldNames, selectedKey, onChange }) => {
  const [isLeaf, setIsLeaf] = useState(false);
  const [isText, setIsText] = useState(false);
  const [disPaste, setDisPaste] = useState(true);
  const [openMdl, setOpenModal] = useState(false);
  const [isEditTag, setIsEditTag] = useState(false);
  const [disRepeat, setDisRepeat] = useState(false);
  const [hiddenTextType, sethCText] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [disabledRadio, setDisabledRadio] = useState(false);
  const [mdlTitle, setMdlTitle] = useState('新建节点');
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [copyNode, setCopyNode] = useState<TreeDataNode>();
  const [selectedNode, setSelectedNode] = useState<TreeDataNode>();
  const [createType, setCreateType] = useState<NodeType>(NodeType.CONTAINER);

  useEffect(() => {
    if (treeData.length) onChange(treeData);
  }, [treeData, onChange]);

  useEffect(() => {
    if (!copyNode || isLeaf) setDisPaste(true);
    else setDisPaste(false);
  }, [copyNode, isLeaf]);

  const initState = useCallback(() => {
    hiddenTextType && sethCText(false);
    isText && setIsText(false);
    isLeaf && setIsLeaf(false);
    isEditTag && setIsEditTag(false);
    copyNode && setCopyNode(undefined);
    disRepeat && setDisRepeat(false);
    disabledRadio && setDisabledRadio(false);
    mdlTitle && setMdlTitle('新建节点');
    createType > 0 && setCreateType(NodeType.CONTAINER);
  }, [
    createType,
    isText,
    hiddenTextType,
    mdlTitle,
    isEditTag,
    disRepeat,
    isLeaf,
    copyNode,
    disabledRadio,
  ]);

  const handleOpenMdl = useCallback(
    (leaf?: boolean) => {
      // @ts-ignore
      if (selectedNode && isEqual(selectedNode['type'], NodeType.TEXT)) {
        message.info('文本内容无法被增添节点');
        return;
      }
      if (!isEqual(leaf, undefined)) {
        setIsLeaf(leaf!);
        setCreateType(leaf ? NodeType.SINGLE : NodeType.CONTAINER);
      }
      setOpenModal(true);
      setSelectedNode(selectedNode);
    },
    [selectedNode]
  );

  const handleCloseMdl = useCallback(() => {
    initState();
    setOpenModal(false);
  }, [initState]);

  const createNode = useCallback(({ value, leaf, type, alias }: CreateNodeResult) => {
    const node = createAntTreeNode(value, alias, leaf, type);
    node.icon = nodeIcons[type];
    return node;
  }, []);

  const onEditNode = useCallback(
    (root: TreeDataNode[], node: TreeDataNode, { value, alias }: CreateNodeResult) => {
      node.title = value;
      // @ts-ignore
      node.alias = alias || value;
      return updateAntTree(root, node);
    },
    []
  );

  const updateNode = useCallback(
    (root: TreeDataNode[], data: CreateNodeResult) => {
      const { value: tag } = data;
      // 1.修改节点标签
      if (isEqual(isEditTag, true)) {
        if (selectedNode?.children?.length && SELF_CLOSING_TAG.includes(tag)) {
          confirm({
            title: '警告',
            content: '自闭合元素不能作为容器，会清空该节点下的子节点',
            onOk() {
              selectedNode.children!.length = 0;
              return onEditNode(root, selectedNode, data);
            },
          });
        }
        return onEditNode(root, selectedNode!, data);
      }
      // 2.新增节点
      selectedNode!.children?.push(createNode(data));
      return updateAntTree(root, selectedNode!);
    },
    [isEditTag, onEditNode, createNode, selectedNode]
  );

  const onClearSelectedNode = useCallback(() => {
    setSelectedNode(undefined);
  }, []);

  const onCreateSinlge = useCallback(() => {
    setOpenModal(true);
    setCreateType(NodeType.SINGLE);
    setMdlTitle('新建单节点');
  }, []);

  const onCreateContainer = useCallback(() => {
    setOpenModal(true);
    setCreateType(NodeType.CONTAINER);
    setMdlTitle('新建容器节点');
  }, []);

  const onAddText = useCallback(() => {
    setOpenModal(true);
    setMdlTitle('添加文本内容');
    setCreateType(NodeType.TEXT);
  }, []);

  const onSetStyle = useCallback(() => {}, []);

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
        setTreeData(deleteNode(clone(treeData), source!));
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

  const onRenameTag = useCallback(() => {
    sethCText(true);
    setOpenModal(true);
    setIsEditTag(true);
    setDisRepeat(true);
    setDisabledRadio(true);
    setMdlTitle('编辑节点');
  }, []);

  const handleOpenCtxMenu = useCallback((info: any) => {
    const { event, node } = info;
    const { clientX, clientY } = event as MouseEvent;
    setSelectedNode(node);
    setOpenCtxMenu(true);
    setIsLeaf(node.isLeaf);
    setIsText(isEqual(node.type, NodeType.TEXT));
    setCtxMenuPosi({ x: clientX, y: clientY + 10 });
  }, []);

  const handleCtxClick = useCallback(
    (value: CTX_MENU_OPTS) => {
      switch (value) {
        case CTX_MENU_OPTS.NEW_LEAF:
          onCreateSinlge();
          break;
        case CTX_MENU_OPTS.NEW_NON_LEAF:
          onCreateContainer();
          break;
        case CTX_MENU_OPTS.ADD_TEXT:
          onAddText();
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
          onRenameTag();
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
      onAddText,
      onCopyNode,
      onCreateContainer,
      onCreateSinlge,
      onCutNode,
      onDeleteNode,
      onPasteNode,
      onRenameTag,
      onSetStyle,
    ]
  );

  const handleClickNode = useCallback((keys: Key[], info: any) => {
    console.log(info);
    setSelectedNode(info.selectedNodes[0]);
  }, []);

  const handleChangeTree = useCallback(
    (res: CreateNodeResult) => {
      let { repeat } = res;
      let newData: TreeDataNode[] = clone(treeData);
      while (repeat--) {
        // 没有选中任何节点进行创建，说明是要创建根节点
        if (!selectedNode) {
          newData.push(createNode(res));
          continue;
        }
        newData = updateNode(newData, res)!;
      }
      setTreeData(newData);
      initState();
      onClearSelectedNode();
    },
    [treeData, selectedNode, createNode, updateNode, initState, onClearSelectedNode]
  );

  return (
    <>
      <ModalCreateNode
        open={openMdl}
        title={mdlTitle}
        type={createType}
        onCancel={handleCloseMdl}
        onChange={handleChangeTree}
        {...{ disRepeat, disabledRadio, hiddenTextType }}
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
              onRightClick={handleOpenCtxMenu}
            />
            <ContextMenu
              open={openCtxMenu}
              onClose={onClearSelectedNode}
              onClick={handleCtxClick}
              {...{ ...ctxMenuPosi, isLeaf, isText, disPaste }}
            />
          </>
        )}
      </section>
    </>
  );
};

export default memo(DirectoryTree);
