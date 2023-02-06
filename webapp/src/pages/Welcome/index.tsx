import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <Button onClick={() => navigate('/home')}>主页</Button>
    </>
  );
};

export default Home;
