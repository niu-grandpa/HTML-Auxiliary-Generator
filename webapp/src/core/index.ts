import generate from './generate';
import * as NodeHandler from './node-handler';
import transform from './transform';

const core = {
  ...generate,
  ...transform,
  ...NodeHandler,
};

export default core;
