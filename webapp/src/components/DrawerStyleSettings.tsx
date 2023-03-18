import { Drawer } from 'antd';
import { FC, memo } from 'react';

type Props = { open: boolean; onClose?: () => void; onChange?: (data: any) => void };

const DrawerStyleSettings: FC<Props> = memo(({ open, onClose, onChange }) => {
  return (
    <Drawer width={360} placement='left' {...{ open, onClose }} title='样式配置'>
      <section>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
        <p>dwadwadda</p>
      </section>
    </Drawer>
  );
});

export { DrawerStyleSettings };
