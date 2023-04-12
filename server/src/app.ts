import express from 'express';
import { api, page } from './routes';

const hostname = 'localhost';
const port = 8080;
const app = express();

app
  .use('/', page)
  .use('/api', api)
  .use('*', (req, res) => {
    res.status(404).render('404', { url: req.originalUrl });
  })
  .listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
