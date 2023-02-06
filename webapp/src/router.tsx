import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { LazyLoading } from './components';

const Home = lazy(() => import('./pages/Home'));
const Error = lazy(() => import('./pages/Error'));
const Welcome = lazy(() => import('./pages/Welcome'));

const routerConfig: RouteObject[] = [
  {
    path: '/',
    children: [
      { path: '', element: <LazyLoading children={<Welcome />} /> },
      { path: '*', element: <LazyLoading children={<Error />} /> },
      { path: 'home', element: <LazyLoading children={<Home />} /> },
    ],
  },
];

export default routerConfig;
