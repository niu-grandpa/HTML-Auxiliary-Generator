import { useRoutes } from 'react-router-dom';
import routerConfig from './router';

import './assets/index.less';

const App = () => useRoutes(routerConfig);

export default App;
