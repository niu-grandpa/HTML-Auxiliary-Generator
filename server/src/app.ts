import express from 'express';
import { api, page } from './routes';

const hostname = 'localhost';
const port = 8080;
const app = express();

app
  .use(express.static('public'))
  .use('/', page)
  .use('/api', api)
  .listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
