import React from 'react';
import { Result } from 'antd';

const Error: React.FC = () => (
  <Result
    status='404'
    title={<div style={{ fontSize: 68 }}>404</div>}
    subTitle='抱歉，当前访问的页面不存在'
  />
);

export default Error;
