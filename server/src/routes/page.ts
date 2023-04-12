import { Router } from 'express';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../views/1.html'));
});

export { router };
