import { MenuProps, Slider } from 'antd';
import React, { useCallback, useState } from 'react';
import ConfigurationBar from './ConfigurationBar';

/**视图操作区域 */
const ViewOperations: React.FC = () => {
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

export default ViewOperations;
