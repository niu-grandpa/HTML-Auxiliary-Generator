import {
  BuildOutlined,
  CodeSandboxOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tree, type TreeDataNode } from 'antd';
import { FC, memo, MouseEvent, useCallback, useMemo, useState } from 'react';
import { ModalCreateNode } from '../../components';
import { ContextMenu, CTX_MENU_OPTS } from '../../components/ContextMenu';
import { type CreateNodeResult } from '../../components/ModalCreateNode';
import core from '../../core';
import { NodeType } from '../../core/runtime-generate';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';

type Props = {
  onChange: (node: TreeDataNode[]) => void;
};

const { createAntTreeNode, updateAntTree, deleteNode } = core;
const { confirm } = Modal;

const nodeIcons = {
  0: <CodeSandboxOutlined />,
  1: <BuildOutlined />,
  2: <FileTextOutlined />,
};

const DirectoryTree: FC<Props> = ({ onChange }) => {
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
  const [currentSelected, setSelectedNode] = useState<TreeDataNode>();
  const [createType, setCreateType] = useState<NodeType>(NodeType.CONTAINER);

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

  const createNode = useCallback((value: string, leaf: boolean, type: NodeType) => {
    const node = createAntTreeNode(value, leaf, type);
    node.icon = nodeIcons[type];
    return node;
  }, []);

  const onEditTag = useCallback((root: TreeDataNode[], node: TreeDataNode, newTag: string) => {
    node.title = newTag;
    updateAntTree(root, node);
  }, []);

  const changeNode = useCallback(
    (root: TreeDataNode[], tagName: string, isLeaf: boolean, type: NodeType) => {
      // 1.修改节点标签
      if (isEditTag) {
        if (currentSelected?.children?.length && SELF_CLOSING_TAG.includes(tagName)) {
          confirm({
            title: '警告',
            content: '自闭合元素不能作为容器，会清空该节点下的子节点',
            onOk() {
              currentSelected.children!.length = 0;
              onEditTag(root, currentSelected, tagName);
            },
          });
        } else {
          onEditTag(root, currentSelected!, tagName);
        }
        // 2.新增节点
      } else {
        currentSelected!.children?.push(createNode(tagName, isLeaf, type));
        updateAntTree(root, currentSelected!);
      }
    },
    [isEditTag, onEditTag, createNode, currentSelected]
  );

  const onClearSelectedNode = useCallback(() => {
    currentSelected && setSelectedNode(undefined);
  }, [currentSelected]);

  const onDeleteOneNode = useCallback(
    (showConfirm = true) => {
      const onDelete = () => {
        const newData = deleteNode(treeData.slice(), currentSelected!);
        setTreeData(newData);
        onClearSelectedNode();
      };
      if (!showConfirm) {
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
    [treeData, currentSelected, onClearSelectedNode]
  );

  const handleChangeTree = useCallback(
    ({ value, type, leaf, count }: CreateNodeResult) => {
      const newData: TreeDataNode[] = treeData.slice();
      while (count--) {
        // 没有选中任何节点进行创建，说明是要创建根节点
        if (!currentSelected) {
          newData.push(createNode(value, leaf, type));
          continue;
        }
        changeNode(newData, value, leaf, type);
      }
      initState();
      onChange(newData);
      setTreeData(newData);
    },
    [treeData, currentSelected, onChange, createNode, changeNode, initState]
  );

  const handleClickNode = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
    setSelectedNode(info.selectedNodes[0]);
  }, []);

  const handleOpenCtxMenu = useCallback((info: any) => {
    const { event, node } = info;
    const { clientX, clientY } = event as MouseEvent;
    setSelectedNode(node);
    setOpenCtxMenu(true);
    setIsLeaf(node.isLeaf);
    setIsText(node.type === NodeType.TEXT);
    setCtxMenuPosi({ x: clientX, y: clientY + 10 });
  }, []);

  // 右键下拉菜单的选项方法
  const getCtxOptsMethods = useMemo(
    () => ({
      // 新建单节点
      0: () => {
        setOpenModal(true);
        setCreateType(NodeType.SINGLE);
        setMdlTitle('新建单节点');
      },
      // 新建容器节点
      1: () => {
        setOpenModal(true);
        setCreateType(NodeType.CONTAINER);
        setMdlTitle('新建容器节点');
      },
      // 添加文本内容
      2: () => {
        setOpenModal(true);
        setMdlTitle('添加文本内容');
        setCreateType(NodeType.TEXT);
      },
      // 样式配置
      3: () => {},
      // 复制
      4: () => {
        message.success('复制成功');
        setCopyNode(() => Object.assign({}, currentSelected));
        onClearSelectedNode();
      },
      // 剪切
      5: () => {
        setCopyNode(() => Object.assign({}, currentSelected));
        onDeleteOneNode();
      },
      // 粘贴
      6: () => {
        if (!currentSelected || !copyNode) {
          message.info('请先复制或剪切节点');
          return;
        }
        if (currentSelected?.isLeaf) {
          message.error('无法粘贴到该节点类型下');
          return;
        }
        // todo 拷贝节点
        // @ts-ignore
        const { title: value, isLeaf: leaf, type } = copyNode!;
        // @ts-ignore
        handleChangeTree({ value, type, leaf, count: 1 });
      },
      // 重命名标签
      7: () => {
        setHCText(true);
        setOpenModal(true);
        setIsEditTag(true);
        setHiddenRepeat(true);
        setDisabledRadio(true);
        setMdlTitle('重命名标签');
      },
      8: onDeleteOneNode,
    }),
    [copyNode, onDeleteOneNode, currentSelected, onClearSelectedNode, handleChangeTree]
  );

  const handleCtxClick = useCallback(
    (value: CTX_MENU_OPTS) => {
      if (value === CTX_MENU_OPTS.NEW_LEAF || value === CTX_MENU_OPTS.NEW_NON_LEAF) {
        getCtxOptsMethods[value]();
        return;
      }
      getCtxOptsMethods[value]();
      setOpenCtxMenu(false);
    },
    [getCtxOptsMethods]
  );

  const handleOpenMdl = useCallback(
    (isLeaf?: boolean) => {
      // @ts-ignore
      if (currentSelected && currentSelected['type'] === NodeType.TEXT) {
        message.info('不能为文本节点增添子节点');
        return;
      }
      if (isLeaf !== undefined) {
        setIsLeaf(isLeaf);
        setCreateType(isLeaf ? NodeType.SINGLE : NodeType.CONTAINER);
      }
      setOpenModal(true);
      setSelectedNode(currentSelected);
    },
    [currentSelected]
  );

  const handleCloseMdl = useCallback(() => {
    initState();
    setOpenModal(false);
  }, [initState]);

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
              treeData={treeData}
              draggable={{ icon: false }}
              onSelect={handleClickNode}
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
