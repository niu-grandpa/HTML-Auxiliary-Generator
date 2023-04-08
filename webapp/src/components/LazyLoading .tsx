import { Spin } from 'antd';
import { ReactNode, Suspense } from 'react';

export const LazyLoading = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <Suspense
      fallback={
        !fallback ? (
          <section
            style={{
              position: 'fixed',
              top: '50%',
              left: '47%',
            }}>
            <Spin tip='Loading...' size='large' />
          </section>
        ) : (
          fallback
        )
      }
      {...{ children }}
    />
  );
};
