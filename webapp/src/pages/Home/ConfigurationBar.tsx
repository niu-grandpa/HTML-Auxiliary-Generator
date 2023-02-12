import { Drawer, Input } from 'antd';
import { FC, memo } from 'react';

type ConfigurationBarProps = Partial<{
  open: boolean;
  onClose: () => void;
  onChange: (data: ConfigData) => void;
}>;

type ConfigData = {};

/**侧边配置栏 */
const ConfigurationBar: FC<ConfigurationBarProps> = ({ open, onClose }) => {
  return (
    <Drawer width={340} placement='left' {...{ open, onClose }} title='常用样式配置'>
      <section className='cfg-bar'>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <Input />
      </section>
    </Drawer>
  );
};

export default memo(ConfigurationBar);
