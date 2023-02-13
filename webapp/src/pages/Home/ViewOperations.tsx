import { Dropdown, MenuProps, Slider } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { useDrag } from '../../hooks';
import ConfigurationBar from './ConfigurationBar';

/**视图操作区域 */
const ViewOperations: React.FC = () => {
  const [scale, setScale] = useState('1');
  const [openConfig, setOpenConfig] = useState(false);

  const a = useRef<HTMLElement>(null);
  const b = useRef<HTMLButtonElement>(null);

  const onCustomCtxMenu = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onAdjustScale = useCallback((newValue: number) => {
    const n = newValue * 0.01;
    setScale((n < 0.3 ? 0.3 : n).toFixed(2));
  }, []);

  const dropdownMeun: MenuProps['items'] = [
    {
      label: '样式配置',
      key: 'setting',
      onClick: useCallback(() => setOpenConfig(true), []),
    },
    {
      label: '删除',
      key: 'delete',
      danger: true,
    },
  ];

  useDrag(b, a, (x, y) => {
    b.current!.style.top = `${y}px`;
    b.current!.style.left = `${x}px`;
    // TODO 碰撞检测
  });

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
        <section ref={a} className='view-opts-box' style={{ transform: `scale(${scale})` }}>
          <Dropdown menu={{ items: dropdownMeun }} trigger={['contextMenu']}>
            <button style={{ position: 'absolute' }} ref={b}>
              创建两条高亮线跟随左右
            </button>
          </Dropdown>
        </section>
      </section>
    </>
  );
};

export default ViewOperations;
