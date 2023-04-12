import { Button } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '介绍 - HTML Auxiliary Generator';
  }, []);

  return (
    <>
      <Button onClick={() => navigate('/home')}>主页</Button>
    </>
  );
};

export default Home;
