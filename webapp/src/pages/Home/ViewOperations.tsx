import { Slider } from 'antd';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { DrawerStyleSettings } from '../../components';
import core from '../../core';
import { type VNode } from '../../core/utils';

type Props = {
  vnodes: VNode[];
};

const { buildHTMLString } = core;

/**视图操作区域 */
const ViewOperations: FC<Props> = memo(({ vnodes }) => {
  const [htmlString, setHTMLString] = useState<string>('');
  const [scale, setScale] = useState('1');
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    setHTMLString(buildHTMLString(vnodes));
  }, [vnodes]);

  const onCustomCtxMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onAdjustScale = useCallback((newValue: number) => {
    const n = newValue * 0.01;
    setScale((n < 0.3 ? 0.3 : n).toFixed(2));
  }, []);

  return (
    <>
      <DrawerStyleSettings open={openDrawer} onClose={() => setOpenDrawer(false)} />
      <section className='view-opts' onContextMenu={onCustomCtxMenu}>
        <div className='view-opts-magnifier'>
          <Slider
            vertical
            min={1}
            max={200}
            defaultValue={100}
            onChange={onAdjustScale}
            tooltip={{ formatter: v => `${v}%` }}
          />
        </div>
        <section className='view-opts-box' style={{ transform: `scale(${scale})` }}></section>
      </section>
    </>
  );
});

export default ViewOperations;
