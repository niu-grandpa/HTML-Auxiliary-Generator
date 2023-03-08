type Config = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function createPlaceholder() {
  const div = document.createElement('div');
  div.id = 'drag-placeholder';
  div.style.position = 'absolute';
  return {
    mountedDragPlaceholder() {
      document.body.appendChild(div);
    },
    setDragPlaceholder({ x, y, width, height }: Config) {
      div.style.width = `${width}px`;
      div.style.height = `${height}px`;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
    },
  };
}

/**
 * 拖拽交互处理
 *
 * 只新建一个用于拖拽的占位元素，
 * 实际上在全局只需处理该元素的拖拽事件和数据计算，
 * 而无需为每个元素都处理，占位元素落下的坐标赋值给目标元素即可。
 */
export function dragElement() {}
