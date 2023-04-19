export const getStringPxToNumber = (str: string): number[] => {
  const [x, y] = (str || '0px 0px').split('px');
  return [Number(x), Number(y)];
};
