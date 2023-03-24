import * as render from './render';
import { generate, savedKeys as SAVED_KEYS } from './runtime-generate';
import * as NodeHandler from './runtime-node';
import transform from './runtime-transform';
import * as utils from './utils';

const core = {
  ...render,
  ...utils,
  ...generate,
  transform,
  SAVED_KEYS,
  ...NodeHandler,
};

export default core;
