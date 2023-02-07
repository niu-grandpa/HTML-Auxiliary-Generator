/**绘制画布网格背景 */
export const drawCanvasGrid = (ctx: CanvasRenderingContext2D, girdSize = 18) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const traverse = (type: 'x' | 'y', total: number) => {
    for (let i = 0; i < total; i++) {
      ctx.beginPath(); // 开启路径，设置不同的样式
      if (type === 'x') {
        ctx.moveTo(0, girdSize * i - 0.5); // -0.5是为了解决像素模糊问题
        ctx.lineTo(width, girdSize * i - 0.5);
      } else {
        ctx.moveTo(girdSize * i, 0);
        ctx.lineTo(girdSize * i, height);
      }
      ctx.strokeStyle = '#f0f0f0'; // 设置每个线条的颜色
      ctx.stroke();
    }
  };

  traverse('x', ~~(height / girdSize));
  traverse('y', ~~(width / girdSize));
};
