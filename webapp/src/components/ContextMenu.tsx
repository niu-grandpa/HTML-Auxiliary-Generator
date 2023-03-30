import { Dropdown, MenuProps } from 'antd';
import { FC, memo, useMemo } from 'react';
import { NodeType } from '../core/runtime-generate';

export const enum CTX_MENU_OPTS {
  NEW_LEAF = '0',
  NEW_NON_LEAF = '1',
  ADD_TEXT = '2',
  SET_STYLE = '3',
  COPY = '4',
  CUT = '5',
  PASTE = '6',
  EDIT_TAG = '7',
  REMOVE = '8',
}

type Props = {
  open: boolean;
  nodeType: NodeType;
  disPaste: boolean;
  children: JSX.Element;
  onClick: ({ key }: { key: string }) => void;
};

const ContextMenu: FC<Props> = memo(
  ({ open, nodeType, disPaste, onClick, children }) => {
    const isText = useMemo(() => nodeType === NodeType.TEXT, [nodeType]);
    const isLeaf = useMemo(() => nodeType !== NodeType.CONTAINER, [nodeType]);
    const items: MenuProps['items'] = useMemo(
      () => [
        {
          label: '新建容器...',
          key: CTX_MENU_OPTS.NEW_NON_LEAF,
          disabled: isLeaf,
          onClick,
        },
        {
          label: '新建文本...',
          key: CTX_MENU_OPTS.ADD_TEXT,
          disabled: isLeaf,
          onClick,
        },
        {
          label: '样式配置...',
          key: CTX_MENU_OPTS.SET_STYLE,
          disabled: isText,
          onClick,
        },
        {
          label: '剪切',
          key: CTX_MENU_OPTS.CUT,
          onClick,
        },
        {
          label: '复制',
          key: CTX_MENU_OPTS.COPY,
          onClick,
        },
        {
          label: '粘贴',
          key: CTX_MENU_OPTS.PASTE,
          disabled: disPaste || isLeaf || isText,
          onClick,
        },
        {
          label: '编辑...',
          key: CTX_MENU_OPTS.EDIT_TAG,
          onClick,
        },
        {
          label: '删除',
          key: CTX_MENU_OPTS.REMOVE,
          onClick,
        },
      ],
      [disPaste, isLeaf, isText, onClick]
    );

    return (
      <Dropdown
        menu={{ items }}
        overlayStyle={{ width: 136 }}
        trigger={['contextMenu']}
        {...{ open }}>
        {children}
      </Dropdown>
    );
  }
);

export { ContextMenu };
