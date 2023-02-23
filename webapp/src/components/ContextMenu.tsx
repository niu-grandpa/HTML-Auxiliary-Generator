import { FC, memo, MouseEvent, useCallback, useEffect, useState } from 'react';

import '../assets/components/ContextMenu.less';

export type ItemType = 'create-leaf' | 'create-notleaf' | 'delete-node' | 'setting-css';

type Props = {
  x: number;
  y: number;
  open: boolean;
  isLeaf: boolean;
  onClick: (value: ItemType) => void;
};

const ContextMenu: FC<Props> = memo(({ x, y, open, isLeaf, onClick }) => {
  const [display, setDisplay] = useState('none');
  const [translate, setTranslate] = useState('');

  const items: { text: string; value: ItemType; hidden?: boolean }[] = [
    {
      text: '新建单节点...',
      value: 'create-leaf',
      hidden: isLeaf,
    },
    {
      text: '新建容器节点...',
      value: 'create-notleaf',
      hidden: isLeaf,
    },
    {
      text: '样式配置...',
      value: 'setting-css',
    },
    {
      text: '删除',
      value: 'delete-node',
    },
  ];

  const handleClick = useCallback(
    (value?: ItemType) => {
      value ?? onClick(value!);
      setDisplay('none');
    },
    [onClick]
  );

  const handleClose = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleClick();
    },
    [handleClick]
  );

  useEffect(() => {
    setDisplay(open ? '' : 'none');
    setTranslate(`translate(${x}px,${y}px)`);
  }, [x, y, open]);

  return (
    <div className='ctx-menu-overlay' style={{ display: display }} onClick={handleClose}>
      <ul className='ctx-menu' style={{ transform: translate }}>
        {items.map(
          ({ text, value, hidden }) =>
            !hidden && (
              <li key={value} className='ctx-menu-item' onClick={() => handleClick(value)}>
                {text}
              </li>
            )
        )}
      </ul>
    </div>
  );
});

export { ContextMenu };
