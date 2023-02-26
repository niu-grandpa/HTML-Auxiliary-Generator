import generate from './generate';
import transform from './transform';

const core = {
  ...generate,
  ...transform,
};

export default core;
