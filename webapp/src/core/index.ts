import { renderDragVnode } from './render';
import { generate, savedKeys as SAVED_KEYS } from './runtime-generate';
import * as NodeHandler from './runtime-node';
import * as transform from './runtime-transform';
import * as utils from './utils';

const core = {
  ...utils,
  ...generate,
  ...transform,
  SAVED_KEYS,
  ...NodeHandler,
  renderDragVnode,
};

export default core;
