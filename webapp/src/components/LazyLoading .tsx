import { Spin } from 'antd';
import { ReactNode, Suspense } from 'react';

export const LazyLoading = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense
      fallback={
        <section
          style={{
            position: 'fixed',
            top: '50%',
            left: '47%',
          }}>
          <Spin tip='Loading...' size='large' />
        </section>
      }
      {...{ children }}
    />
  );
};
