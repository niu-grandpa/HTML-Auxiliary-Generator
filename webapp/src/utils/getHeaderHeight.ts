/**获取页面头部导航栏高度，用于计算拖拽元素的Y差值 */
export const getHeaderHeight = (): number => {
  const menuHeader = document.querySelector(
    '#getHeaderHeight'
  ) as HTMLHeadElement;
  return menuHeader.offsetHeight;
};
