import * as handleInteraction from './handle-interaction';
import generate from './runtime-generate';
import * as NodeHandler from './runtime-node';
import transform from './runtime-transform';
import * as utils from './utils';

const core = {
  ...utils,
  ...generate,
  transform,
  ...NodeHandler,
  ...handleInteraction,
};

export default core;
