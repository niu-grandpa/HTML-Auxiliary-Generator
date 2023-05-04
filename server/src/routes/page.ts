import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.redirect('/'));
router.get('/home', (req, res) => {
  // todo 发送对应静态文件
});
router.get('/tutorial', (req, res) => {
  // todo 发送对应静态文件
});
router.get('/user-center', (req, res) => {
  // todo 发送对应静态文件
});
router.get('*', (req, res) => {
  // todo 发送对应静态文件
});

export { router };
