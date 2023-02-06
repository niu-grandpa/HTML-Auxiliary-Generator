import { BrowserRouter, Routes } from 'react-router-dom';
import { renderRouterConfig } from './utils';

import './assets/index.less';

const App = () => (
  <BrowserRouter>
    <Routes>{renderRouterConfig()}</Routes>
  </BrowserRouter>
);

export default App;
