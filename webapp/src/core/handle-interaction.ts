/**
 * 拖拽交互处理
 *
 * 只新建一个用于拖拽的占位元素，
 * 实际上在全局只需处理该元素的拖拽事件和数据计算，
 * 而无需为每个元素都处理，占位元素落下的坐标赋值给目标元素即可。
 */
export function onDrag() {
  let source: HTMLDivElement | null = null;
  // todo

  return {
    active() {
      if (source !== null) return;
      source = document.createElement('div');

      source.id = '__drag_placeholder__';
      source.draggable = true;

      source.style.position = 'absolute';
      source.style.border = '2px dashed #00a6ff';

      document.body.appendChild(source);
    },
    setPosition(x: number, y: number) {
      if (source === null) return;
      source.style.top = `${y}px`;
      source.style.left = `${x}px`;
    },
  };
}
