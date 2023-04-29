import { Dropdown, MenuProps } from 'antd';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { NodeType } from '../../core/type';

export const enum CTX_MENU_OPTS {
  NEW_LEAF = '0',
  NEW_NON_LEAF = '1',
  ADD_TEXT = '2',
  COPY = '3',
  CUT = '4',
  PASTE = '5',
  EDIT_TAG = '6',
  REMOVE = '7',
}

type Props = {
  open: boolean;
  nodeType: NodeType;
  canPaste: boolean;
  children: JSX.Element;
  onClose: () => void;
  onClick: (key: string) => void;
};

const ContextMenu: FC<Props> = memo(
  ({ open, nodeType, canPaste, onClick, onClose, children }) => {
    useEffect(() => {
      const handleClose = (e: MouseEvent) => {
        e.stopPropagation();
        onClose();
      };
      document.addEventListener('click', handleClose);
      return () => {
        document.removeEventListener('click', handleClose);
      };
    }, [onClose]);

    const isText = useMemo(() => nodeType === NodeType.TEXT, [nodeType]);
    const isLeaf = useMemo(() => nodeType !== NodeType.CONTAINER, [nodeType]);

    const handleClick = useCallback(
      ({ key }: { key: string }) => {
        onClick(key);
        onClose();
      },
      [onClick, onClose]
    );

    const items: MenuProps['items'] = useMemo(
      () => [
        {
          label: '新建...',
          key: CTX_MENU_OPTS.NEW_NON_LEAF,
          disabled: isLeaf,
          onClick: handleClick,
        },
        {
          label: '内容...',
          key: CTX_MENU_OPTS.ADD_TEXT,
          disabled: isLeaf,
          onClick: handleClick,
        },
        {
          label: '复制',
          key: CTX_MENU_OPTS.COPY,
          onClick: handleClick,
        },
        {
          label: '剪切',
          key: CTX_MENU_OPTS.CUT,
          onClick: handleClick,
        },
        {
          label: '粘贴',
          key: CTX_MENU_OPTS.PASTE,
          disabled: canPaste || isLeaf || isText,
          onClick: handleClick,
        },
        {
          label: '修改...',
          key: CTX_MENU_OPTS.EDIT_TAG,
          onClick: handleClick,
        },
        {
          label: '删除',
          key: CTX_MENU_OPTS.REMOVE,
          onClick: handleClick,
          danger: true,
        },
      ],
      [canPaste, isLeaf, isText, handleClick]
    );

    return (
      <Dropdown
        menu={{ items }}
        overlayStyle={{ width: 120 }}
        trigger={['contextMenu']}
        {...{ open }}>
        {children}
      </Dropdown>
    );
  }
);

export { ContextMenu };
