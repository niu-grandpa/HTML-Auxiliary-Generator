import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal } from 'antd';
import { memo, useCallback, useState } from 'react';

type UserInfo = {
  username: string;
  password: string;
  remember: boolean;
};

type Props = {
  loginToken?: string;
  onSuccess?: Promise<(info: UserInfo) => void>;
  onFailed?: Promise<() => void>;
};

const Login = memo<Props>(({ loginToken }) => {
  const [openLogin, setOpenLogin] = useState(false);

  const handleLogin = useCallback((values: UserInfo) => {
    console.log(values);
    setOpenLogin(false);
  }, []);

  return (
    <>
      <Button
        type='primary'
        ghost
        shape='round'
        icon={<UserOutlined />}
        onClick={() => setOpenLogin(true)}>
        登录
      </Button>
      <Modal
        width={420}
        open={openLogin}
        destroyOnClose
        footer={false}
        title='欢迎登录'
        bodyStyle={{ paddingTop: 24 }}
        onCancel={() => setOpenLogin(false)}>
        <Form
          autoComplete='off'
          name='login-form'
          initialValues={{ remember: true }}
          onFinish={handleLogin}>
          <Form.Item
            name='username'
            rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='用户名'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[{ required: true, message: '请输入密码!' }]}>
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='密码'
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name='remember' valuePropName='checked' noStyle>
              <Checkbox>自动登录</Checkbox>
            </Form.Item>
            <a
              style={{ float: 'right' }}
              href='/'
              onClick={e => e.preventDefault()}>
              忘记密码
            </a>
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              block
              htmlType='submit'
              className='login-form-button'>
              登录
            </Button>
            <a href='/' onClick={e => e.preventDefault()}>
              注册
            </a>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default Login;
