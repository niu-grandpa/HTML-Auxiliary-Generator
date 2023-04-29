import { Dropdown, MenuProps } from 'antd';
import {
  BaseSyntheticEvent,
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { NodeType, ProcessTreeDataNode } from '../../core/type';

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

export type ContextMenuHandlers = Partial<{
  onCreate: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onContent: () => void;
}>;

type Props = {
  open: boolean;
  canPaste: boolean;
  children: JSX.Element;
  onClose: () => void;
  target: ProcessTreeDataNode | undefined | null;
  handler: ContextMenuHandlers;
};

const map: Record<string, string> = {
  '1': 'onCreate',
  '2': 'onContent',
  '3': 'onCopy',
  '4': 'onCut',
  '5': 'onPaste',
  '6': 'onEdit',
  '7': 'onDelete',
};

const ContextMenu: FC<Props> = memo(
  ({ open, target, canPaste, handler, onClose, children }) => {
    useEffect(() => {
      document.addEventListener('click', onClose, true);
      return () => {
        document.removeEventListener('click', onClose, true);
      };
    }, [onClose]);

    const overDisabled = useMemo(() => !target, [target]);
    const isText = useMemo(
      () => target?.type === NodeType.TEXT,
      [target?.type]
    );
    const isLeaf = useMemo(
      () => target?.type === NodeType.CONTAINER,
      [target?.type]
    );

    const isPaste = useMemo(
      () => canPaste && (!isLeaf || !isText),
      [canPaste, isLeaf, isText]
    );

    const handleClick = useCallback(
      ({ key, domEvent }: { key: string; domEvent: BaseSyntheticEvent }) => {
        domEvent.stopPropagation();
        const funcName = map[key];
        // @ts-ignore
        handler[funcName]?.();
        onClose();
      },
      [handler, onClose]
    );

    const items: MenuProps['items'] = useMemo(
      () => [
        {
          label: '新建...',
          key: CTX_MENU_OPTS.NEW_NON_LEAF,
          disabled: isText,
          onClick: handleClick,
        },
        {
          label: '添加内容',
          key: CTX_MENU_OPTS.ADD_TEXT,
          disabled: overDisabled || isText,
          onClick: handleClick,
        },
        {
          label: '复制',
          key: CTX_MENU_OPTS.COPY,
          disabled: overDisabled,
          onClick: handleClick,
        },
        {
          label: '剪切',
          key: CTX_MENU_OPTS.CUT,
          disabled: overDisabled,
          onClick: handleClick,
        },
        {
          label: '粘贴',
          key: CTX_MENU_OPTS.PASTE,
          disabled: !isPaste,
          onClick: handleClick,
        },
        {
          label: '修改...',
          key: CTX_MENU_OPTS.EDIT_TAG,
          disabled: overDisabled,
          onClick: handleClick,
        },
        {
          label: '删除',
          key: CTX_MENU_OPTS.REMOVE,
          onClick: handleClick,
          disabled: overDisabled,
          danger: true,
        },
      ],
      [isPaste, isText, overDisabled, handleClick]
    );

    return (
      <Dropdown
        {...{ open }}
        menu={{ items }}
        trigger={['contextMenu']}
        overlayStyle={{ width: 120 }}>
        {children}
      </Dropdown>
    );
  }
);

export { ContextMenu };
