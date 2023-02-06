import { Route } from 'react-router-dom';
import routerConfig from '../router';

const renderRouterConfig = (): JSX.Element[] => {
  return routerConfig.map(({ path, element, children }) => (
    <Route {...{ path, element, children }} key={path} />
  ));
};

export default renderRouterConfig;
