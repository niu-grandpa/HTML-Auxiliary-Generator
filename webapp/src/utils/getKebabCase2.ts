/**将骆驼命名规则的字符串转换成使用短横线命名法的字符串 */
export const getKebabCase2 = (str: string) => {
  return str.replace(/[A-Z]/g, item => '-' + item.toLowerCase());
};
