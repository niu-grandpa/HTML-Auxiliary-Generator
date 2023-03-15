import {
  BuildOutlined,
  CodeSandboxOutlined,
  FileAddOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Tree, type TreeDataNode } from 'antd';
import { FC, memo, MouseEvent, useCallback, useState } from 'react';
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

const DirectoryTree: FC<Props> = ({ onChange }) => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [isEditTag, setIsEditTag] = useState(false);
  const [hCText, setHCText] = useState(false);
  const [custom, setCustom] = useState<'leaf' | 'non-leaf' | undefined>(undefined);
  const [mdlTitle, setMdlTitle] = useState('新建视图');
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [currentSelected, setSelectedNode] = useState<TreeDataNode>();

  const initState = useCallback(() => {
    hCText && setHCText(false);
    custom && setCustom(undefined);
    curIsLeaf && setCurIsLeaf(false);
    isEditTag && setIsEditTag(false);
    currentSelected && setSelectedNode(undefined);
  }, [custom, hCText, isEditTag, curIsLeaf, currentSelected]);

  const createNode = useCallback((value: string, leaf: boolean, type: NodeType) => {
    const node = createAntTreeNode(value, leaf, type);
    node.icon = leaf ? <BuildOutlined /> : <CodeSandboxOutlined />;
    return node;
  }, []);

  const editTag = useCallback((root: TreeDataNode[], node: TreeDataNode, newTag: string) => {
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
              editTag(root, currentSelected, tagName);
            },
          });
        } else {
          editTag(root, currentSelected!, tagName);
        }
        // 2.新增节点
      } else {
        currentSelected!.children?.push(createNode(tagName, isLeaf, type));
        updateAntTree(root, currentSelected!);
      }
    },
    [isEditTag, editTag, createNode, currentSelected]
  );

  const deleteOneNode = useCallback(() => {
    confirm({
      title: '警告',
      content: '确定要删除该节点吗?',
      onOk() {
        message.success('删除成功');
        const newData = deleteNode(treeData.slice(), currentSelected!);
        setTreeData(newData);
        initState();
      },
    });
  }, [treeData, currentSelected, initState]);

  const handleChangeTree = useCallback(
    ({ value, type, leaf }: CreateNodeResult) => {
      const newData: TreeDataNode[] = treeData.slice();
      // 没有选中任何节点进行创建，说明是要创建根节点
      if (!currentSelected) {
        newData.push(createNode(value, leaf, type));
      } else {
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
    setCurIsLeaf(node.isLeaf);
    setCtxMenuPosi({ x: clientX, y: clientY + 10 });
  }, []);

  const handleCtxClick = useCallback(
    (value: CTX_MENU_OPTS) => {
      const leaf = value === CTX_MENU_OPTS.NEW_LEAF;
      const nonLeaf = value === CTX_MENU_OPTS.NEW_NON_LEAF;
      if (leaf || nonLeaf) {
        setOpenModal(true);
        leaf && setCustom('leaf');
        nonLeaf && setCustom('non-leaf');
        setMdlTitle(`新建${leaf ? '单' : '容器'}节点`);
      } else if (value === CTX_MENU_OPTS.ADD_TEXT) {
        setOpenModal(true);
      } else if (value === CTX_MENU_OPTS.EDIT_TAG) {
        setHCText(true);
        setOpenModal(true);
        setIsEditTag(true);
        setMdlTitle('重命名标签');
      } else if (value === CTX_MENU_OPTS.REMOVE) {
        deleteOneNode();
      } else if (value === CTX_MENU_OPTS.SET_STYLE) {
        // todo
      }
      setOpenCtxMenu(false);
    },
    [deleteOneNode]
  );

  const handleOpenMdl = useCallback(
    (isLeaf?: boolean) => {
      if (isLeaf !== undefined) {
        setCurIsLeaf(isLeaf);
        setCustom(isLeaf ? 'leaf' : 'non-leaf');
      }
      if (currentSelected) {
        setSelectedNode(currentSelected);
      }
      setOpenModal(true);
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
        custom={custom}
        open={openMdl}
        hiddenCreateText={hCText}
        onChange={handleChangeTree}
        onCancel={handleCloseMdl}
      />
      <section className='file-list' onContextMenu={e => e.preventDefault()}>
        <Row>
          <Col style={{ fontSize: 13 }} span={18}>
            结构管理(工作区)
          </Col>
          {treeData.length ? (
            <>
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
            </>
          ) : null}
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
              draggable={{ icon: false }}
              defaultExpandAll
              treeData={treeData}
              onSelect={handleClickNode}
              onRightClick={handleOpenCtxMenu}
            />
            <ContextMenu
              {...{ ...ctxMenuPosi }}
              open={openCtxMenu}
              isLeaf={curIsLeaf}
              onClick={handleCtxClick}
            />
          </>
        )}
      </section>
    </>
  );
};

export default memo(DirectoryTree);
