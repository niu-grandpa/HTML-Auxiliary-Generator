/**
 * 计算出来的元素x坐标是相对于画布的，
 *
 * 因此当导出元素的x坐标需加上此画布损失的右边距整个浏览器剩余的宽度比值,
 *
 * 公式：{targetX + [targetX / [(bodyW - wrapperW) / 100)]]}
 */
export function calcActualPos(
  wrapper: HTMLElement,
  targetX: number,
  targetY: number
): [number, number] {
  const bodyWidth = document.body.offsetWidth;
  const wrapperWidth = wrapper.offsetWidth;
  // 画布所占页面宽度需补全的剩余百分比
  const remainingPrcentage = (bodyWidth - wrapperWidth) / 100;
  const loss = targetX / remainingPrcentage;
  return [~~(targetX + loss), ~~targetY];
}
