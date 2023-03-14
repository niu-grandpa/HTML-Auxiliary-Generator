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
import core from '../../core';
import { SELF_CLOSING_TAG } from '../../core/runtime-transform';

type Props = {
  onChange: (node: TreeDataNode[]) => void;
};

const { createAntTreeNode, updateAntTree, deleteNode } = core;
const { DirectoryTree: Directory } = Tree;
const { confirm } = Modal;

const DirectoryTree: FC<Props> = ({ onChange }) => {
  const [openMdl, setOpenModal] = useState(false);
  const [openCtxMenu, setOpenCtxMenu] = useState(false);
  const [curIsLeaf, setCurIsLeaf] = useState(false);
  const [isEditTag, setIsEditTag] = useState(false);
  const [custom, setCustom] = useState<'leaf' | 'non-leaf' | undefined>(undefined);
  const [mdlTitle, setMdlTitle] = useState('新建视图容器');
  const [ctxMenuPosi, setCtxMenuPosi] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [currentSelected, setSelectedNode] = useState<TreeDataNode>();

  const initState = useCallback(() => {
    custom && setCustom(undefined);
    curIsLeaf && setCurIsLeaf(false);
    isEditTag && setIsEditTag(false);
    currentSelected && setSelectedNode(undefined);
  }, [custom, isEditTag, curIsLeaf, currentSelected]);

  const createNode = useCallback((tagName: string, isLeaf: boolean) => {
    const node = createAntTreeNode(tagName, isLeaf);
    node.icon = isLeaf ? <BuildOutlined /> : <CodeSandboxOutlined />;
    return node;
  }, []);

  const editTag = useCallback((root: TreeDataNode[], node: TreeDataNode, newTag: string) => {
    node.title = newTag;
    updateAntTree(root, node);
  }, []);

  const changeNode = useCallback(
    (root: TreeDataNode[], node: TreeDataNode, tagName: string, isLeaf: boolean) => {
      // 1.修改节点标签
      if (isEditTag) {
        if (node?.children?.length && SELF_CLOSING_TAG.includes(tagName)) {
          confirm({
            title: '警告',
            content: '自闭合元素无法容纳子节点，如果这么做会清空该节点下的所有子节点',
            onOk() {
              node.children!.length = 0;
              editTag(root, node, tagName);
            },
          });
        } else {
          editTag(root, node, tagName);
        }
        // 2.新增节点
      } else {
        node.children?.push(createNode(tagName, isLeaf));
        updateAntTree(root, node);
      }
    },
    [isEditTag, editTag, createNode]
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

  const isCreateRoot = useCallback(() => currentSelected === undefined, [currentSelected]);

  const handleChangeData = useCallback(
    (tagName: string, isLeaf: boolean) => {
      const newData: TreeDataNode[] = treeData.slice();
      // 没有选中任何节点进行创建，说明是要创建根节点
      if (isCreateRoot()) {
        newData.push(createNode(tagName, isLeaf));
      } else if (currentSelected) {
        changeNode(newData, currentSelected, tagName, isLeaf);
      }
      initState();
      onChange(newData);
      setTreeData(newData);
    },
    [treeData, currentSelected, onChange, createNode, changeNode, isCreateRoot, initState]
  );

  const handleClickNode = useCallback((keys: any, info: any) => {
    console.log('Trigger Select', keys, info);
    setSelectedNode(info.node);
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
        // todo
      } else if (value === CTX_MENU_OPTS.EDIT_TAG) {
        setOpenModal(true);
        setIsEditTag(true);
        setMdlTitle('修改容器标签');
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
        onChange={handleChangeData}
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
            <Directory
              defaultExpandAll
              showLine
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
