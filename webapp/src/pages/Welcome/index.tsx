import { Button } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainIcon from '../../assets/images/main.svg';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '介绍 - HTML Auxiliary Generator';
  }, []);

  return (
    <>
      <Button onClick={() => navigate('/home')}>主页</Button>
      <img src={MainIcon} alt='main' />
    </>
  );
};

export default Home;
