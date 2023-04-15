import { memo, useCallback, useMemo } from 'react';

export type ResizeElemData = {
  coordinate: string;
  refWidth: number;
  refHeight: number;
};

type Props = {
  open: boolean;
  data: ResizeElemData;
  onResize: (w: number, height: number) => void;
};

const dotCls = [
  'top',
  'top center',
  'top end',
  'left',
  'right',
  'bottom',
  'bottom center',
  'bottom end',
];

const ResizeElem = memo<Props>(({ open, data, onResize }) => {
  const visible = useMemo(() => (open ? '' : 'none'), [open]);
  const refElmSize = useMemo(
    () => ({
      width: data.refWidth + (data.refWidth >> 1),
      height: data.refHeight + (data.refHeight >> 1),
    }),
    [data]
  );
  const translate = useMemo(() => {
    const [x, y] = data.coordinate.split('px');
    const _x = parseInt(x) - (data.refWidth >> 2);
    const _y = parseInt(y) - (data.refHeight >> 2);
    return `${_x}px ${_y}px`;
  }, [data]);

  const handleResize = useCallback(() => {}, []);

  return (
    <ul
      className='view-opts-resize-elm'
      onContextMenu={e => e.stopPropagation()}
      style={{ ...refElmSize, display: visible, translate: translate }}>
      {dotCls.map(cls => (
        <li key={cls} className={`view-opts-resize-elm-dot ${cls}`} />
      ))}
    </ul>
  );
});

export default ResizeElem;
