import { Slider } from 'antd';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { type VNode } from '../../core/utils';

import ConfigurationBar from './ConfigurationBar';

type Props = {
  vnode: VNode[];
};

/**视图操作区域 */
const ViewOperations: FC<Props> = ({ vnode }) => {
  const data = useMemo(() => vnode, [vnode]);

  const [scale, setScale] = useState('1');
  const [openConfig, setOpenConfig] = useState(false);

  const onCustomCtxMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onAdjustScale = useCallback((newValue: number) => {
    const n = newValue * 0.01;
    setScale((n < 0.3 ? 0.3 : n).toFixed(2));
  }, []);

  useEffect(() => {
    if (data.length) {
      console.log(data);
    }
  }, [data]);

  return (
    <>
      <ConfigurationBar open={openConfig} onClose={() => setOpenConfig(false)} />
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
        <section className='view-opts-box' style={{ transform: `scale(${scale})` }}>
          {/* <Dropdown menu={{ items: dropdownMeun }} trigger={['contextMenu']}></Dropdown> */}
        </section>
      </section>
    </>
  );
};

export default memo(ViewOperations);
