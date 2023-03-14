import { FC, memo, MouseEvent, useCallback, useEffect, useState } from 'react';

import '../assets/components/ContextMenu.less';

export const enum CTX_MENU_OPTS {
  NEW_LEAF,
  NEW_NON_LEAF,
  ADD_TEXT,
  SET_STYLE,
  EDIT_TAG,
  REMOVE,
}

type Props = {
  x: number;
  y: number;
  open: boolean;
  isLeaf: boolean;
  onClick: (type: CTX_MENU_OPTS) => void;
};

const ContextMenu: FC<Props> = memo(({ x, y, open, isLeaf, onClick }) => {
  const [display, setDisplay] = useState('none');
  const [translate, setTranslate] = useState('');

  const items: { text: string; type: CTX_MENU_OPTS; hidden?: boolean }[] = [
    {
      text: '新建单节点...',
      type: CTX_MENU_OPTS.NEW_LEAF,
      hidden: isLeaf,
    },
    {
      text: '新建容器节点...',
      type: CTX_MENU_OPTS.NEW_NON_LEAF,
      hidden: isLeaf,
    },
    {
      text: '添加文本',
      type: CTX_MENU_OPTS.ADD_TEXT,
    },
    {
      text: '样式配置...',
      type: CTX_MENU_OPTS.SET_STYLE,
    },
    {
      text: '修改...',
      type: CTX_MENU_OPTS.EDIT_TAG,
    },
    {
      text: '删除',
      type: CTX_MENU_OPTS.REMOVE,
    },
  ];

  const handleClick = useCallback(
    (e?: MouseEvent, type?: CTX_MENU_OPTS) => {
      e?.stopPropagation();
      type !== undefined && onClick(type);
      setDisplay('none');
    },
    [onClick]
  );

  const handleClose = useCallback(() => {
    handleClick();
  }, [handleClick]);

  useEffect(() => {
    setDisplay(open ? '' : 'none');
    setTranslate(`translate(${x}px,${y}px)`);
  }, [x, y, open]);

  return (
    <div
      className='ctx-menu-overlay'
      style={{ display: display }}
      onClick={handleClose}
      onContextMenu={handleClose}>
      <ul className='ctx-menu' style={{ transform: translate }}>
        {items.map(
          ({ text, type, hidden }) =>
            !hidden && (
              <li key={text} className='ctx-menu-item' onClick={e => handleClick(e, type)}>
                {text}
              </li>
            )
        )}
      </ul>
    </div>
  );
});

export { ContextMenu };
