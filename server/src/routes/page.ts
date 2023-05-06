/**
 * 本质上前端的路由都是通过js动态切换的，并不存在对应html页面
 * 因此，前端访问的任何路径始终都需要返回index.html，交由前端处理
 */

import { Router } from 'express';
import path from 'path';

const router = Router();

const redirect = (res: any) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../../public/index.html'));
};

router.get('/', (_, res) => res.redirect('/'));
router.get('/home', (_, res) => redirect(res));
router.get('/tutorial', (_, res) => redirect(res));
router.get('/user-center', (_, res) => redirect(res));
router.get('*', (_, res) => redirect(res));

export { router };
