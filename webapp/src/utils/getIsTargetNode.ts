import { isEqual } from 'lodash';

const targetDatasetName = 'isDragTarget';

export const getIsTargetNode = (target: HTMLElement) => {
  if (!isEqual(target.dataset[targetDatasetName], 'true')) {
    return false;
  }
  return target;
};
