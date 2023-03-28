import {
  FC,
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import '../assets/components/ContextMenu.less';
import { NodeType } from '../core/runtime-generate';

export const enum CTX_MENU_OPTS {
  NEW_LEAF,
  NEW_NON_LEAF,
  ADD_TEXT,
  SET_STYLE,
  COPY,
  CUT,
  PASTE,
  EDIT_TAG,
  REMOVE,
}

type Props = {
  x: number;
  y: number;
  open: boolean;
  nodeType: NodeType;
  /**禁用粘贴 */
  disPaste: boolean;
  onClose: () => void;
  onClick: (type: CTX_MENU_OPTS) => void;
};

type ItemsType = {
  text: string;
  type: CTX_MENU_OPTS;
  hidden?: boolean;
  disabled?: boolean;
};

const ContextMenu: FC<Props> = memo(
  ({ x, y, open, nodeType, disPaste, onClick, onClose }) => {
    const [display, setDisplay] = useState('none');
    const [translate, setTranslate] = useState('');

    const isText = useMemo(() => nodeType === NodeType.TEXT, [nodeType]);
    const isLeaf = useMemo(() => nodeType !== NodeType.CONTAINER, [nodeType]);

    const items: ItemsType[] = useMemo(
      () => [
        {
          text: '新建容器...',
          type: CTX_MENU_OPTS.NEW_NON_LEAF,
          hidden: isLeaf,
        },
        {
          text: '新建文本...',
          type: CTX_MENU_OPTS.ADD_TEXT,
          hidden: isLeaf,
        },
        {
          text: '样式配置...',
          type: CTX_MENU_OPTS.SET_STYLE,
          hidden: isText,
        },
        {
          text: '剪切',
          type: CTX_MENU_OPTS.CUT,
        },
        {
          text: '复制',
          type: CTX_MENU_OPTS.COPY,
        },
        {
          text: '粘贴',
          type: CTX_MENU_OPTS.PASTE,
          disabled: disPaste || isLeaf || isText,
        },
        {
          text: '编辑...',
          type: CTX_MENU_OPTS.EDIT_TAG,
        },
        {
          text: '删除',
          type: CTX_MENU_OPTS.REMOVE,
        },
      ],
      [disPaste, isLeaf, isText]
    );

    const handleClick = useCallback(
      (e: MouseEvent, type: CTX_MENU_OPTS, ignore?: boolean) => {
        e.stopPropagation();
        if (ignore) return;
        onClick(type);
        setDisplay('none');
      },
      [onClick]
    );

    const handleClose = useCallback(() => {
      onClose();
      setDisplay('none');
    }, [onClose]);

    useEffect(() => {
      setDisplay(open ? '' : 'none');
      setTranslate(`translate(${x}px,${y}px)`);
    }, [x, y, open]);

    useEffect(() => {
      window.addEventListener('resize', handleClose);
      return () => {
        window.removeEventListener('resize', handleClose);
      };
    }, [handleClose]);

    return (
      <div
        className='ctx-menu-overlay'
        style={{ display: display }}
        onClick={handleClose}
        onContextMenu={handleClose}>
        <ul className='ctx-menu' style={{ transform: translate }}>
          {items.map(
            ({ text, type, hidden, disabled }) =>
              !hidden && (
                <li
                  key={text}
                  className={`ctx-menu-item ${disabled ? 'disabled' : ''}`}
                  onClick={e => handleClick(e, type, disabled)}>
                  {text}
                </li>
              )
          )}
        </ul>
      </div>
    );
  }
);

export { ContextMenu };
