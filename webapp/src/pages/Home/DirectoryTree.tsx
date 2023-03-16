import {
  BuildOutlined,
  CodeSandboxOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tree, type TreeDataNode } from 'antd';
import { cloneDeep, head, isEqual } from 'lodash-es';
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
};

const { createAntTreeNode, updateAntTree, deleteNode, resolveKeyConflicts } = core;
const { confirm } = Modal;

const nodeIcons = {
  0: <CodeSandboxOutlined />,
  1: <BuildOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = ({ selectedKey, onChange }) => {
  const [isLeaf, setIsLeaf] = useState(false);
  const [isText, setIsText] = useState(false);
  const [hCText, setHCText] = useState(false);
  const [openMdl, setOpenModal] = useState(false);
  const [isEditTag, setIsEditTag] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [hiddenRepeat, setHiddenRepeat] = useState(false);
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

  const initState = useCallback(() => {
    hCText && setHCText(false);
    isText && setIsText(false);
    isLeaf && setIsLeaf(false);
    isEditTag && setIsEditTag(false);
    copyNode && setCopyNode(undefined);
    hiddenRepeat && setHiddenRepeat(false);
    disabledRadio && setDisabledRadio(false);
    mdlTitle && setMdlTitle('新建节点');
    createType > 0 && setCreateType(NodeType.CONTAINER);
  }, [
    createType,
    isText,
    hCText,
    mdlTitle,
    isEditTag,
    hiddenRepeat,
    isLeaf,
    copyNode,
    disabledRadio,
  ]);

  const handleOpenMdl = useCallback(
    (isLeaf?: boolean) => {
      // @ts-ignore
      if (selectedNode && isEqual(selectedNode['type'], NodeType.TEXT)) {
        message.info('不能为文本节点增添子节点');
        return;
      }
      if (!isEqual(isLeaf, undefined)) {
        setIsLeaf(isLeaf!);
        setCreateType(isLeaf ? NodeType.SINGLE : NodeType.CONTAINER);
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

  const createNode = useCallback((value: string, leaf: boolean, type: NodeType) => {
    const node = createAntTreeNode(value, leaf, type);
    node.icon = nodeIcons[type];
    return node;
  }, []);

  const changeTag = useCallback((root: TreeDataNode[], node: TreeDataNode, newTag: string) => {
    node.title = newTag;
    updateAntTree(root, node);
  }, []);

  const updateNode = useCallback(
    (root: TreeDataNode[], tagName: string, isLeaf: boolean, type: NodeType) => {
      // 1.修改节点标签
      if (isEqual(isEditTag, true)) {
        if (selectedNode?.children?.length && SELF_CLOSING_TAG.includes(tagName)) {
          confirm({
            title: '警告',
            content: '自闭合元素不能作为容器，会清空该节点下的子节点',
            onOk() {
              selectedNode.children!.length = 0;
              changeTag(root, selectedNode, tagName);
            },
          });
          return;
        }
        changeTag(root, selectedNode!, tagName);
        return;
      }
      // 2.新增节点
      selectedNode!.children?.push(createNode(tagName, isLeaf, type));
      updateAntTree(root, selectedNode!);
      return root;
    },
    [isEditTag, changeTag, createNode, selectedNode]
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
      message.success('复制成功');
      setCopyNode(cloneDeep(source));
      onClearSelectedNode();
    },
    [onClearSelectedNode]
  );

  const onDeleteNode = useCallback(
    (source: TreeDataNode, showConfirm = true) => {
      const onDelete = () => {
        setTreeData(deleteNode(cloneDeep(treeData), source!));
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
      setCopyNode(cloneDeep(source));
      onDeleteNode(source, false);
    },
    [treeData, onClearSelectedNode, onDeleteNode]
  );

  const onPasteNode = useCallback(
    (target: TreeDataNode, source: TreeDataNode) => {
      if (isEqual(source, undefined) || isEqual(target, undefined)) {
        message.info('请先复制或剪切节点');
        return;
      }
      if (isEqual(source?.isLeaf, undefined)) {
        message.error('无法粘贴到该节点类型下');
        return;
      }
      // todo
      resolveKeyConflicts(target);
      source.children?.push(target);
      onClearSelectedNode();
      setCopyNode(undefined);
      setTreeData(updateAntTree(cloneDeep(treeData), source));
    },
    [onClearSelectedNode, treeData]
  );

  const onRenameTag = useCallback(() => {
    setHCText(true);
    setOpenModal(true);
    setIsEditTag(true);
    setHiddenRepeat(true);
    setDisabledRadio(true);
    setMdlTitle('重命名标签');
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
    ({ value, type, leaf, count }: CreateNodeResult) => {
      const newData: TreeDataNode[] = cloneDeep(treeData);
      while (count--) {
        // 没有选中任何节点进行创建，说明是要创建根节点
        if (!selectedNode) {
          newData.push(createNode(value, leaf, type));
          continue;
        }
        updateNode(newData, value, leaf, type);
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
        title={mdlTitle}
        open={openMdl}
        type={createType}
        {...{ hiddenRepeat, disabledRadio }}
        hiddenTextType={hCText}
        onChange={handleChangeTree}
        onCancel={handleCloseMdl}
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
              {...{ treeData }}
              draggable={{ icon: false }}
              onSelect={handleClickNode}
              selectedKeys={[selectedKey]}
              onRightClick={handleOpenCtxMenu}
            />
            <ContextMenu
              open={openCtxMenu}
              onClose={onClearSelectedNode}
              onClick={handleCtxClick}
              {...{ ...ctxMenuPosi, isLeaf, isText }}
            />
          </>
        )}
      </section>
    </>
  );
};

export default memo(DirectoryTree);
