import { useEffect, useRef } from 'react';
import { drawCanvasGrid } from '../../utils';

/**视图操作区域 */
const ViewOperations: React.FC = () => {
  const wrapperElm = useRef<HTMLElement>(null);
  const canvasElm = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (wrapperElm.current && canvasElm.current) {
      canvasElm.current!.width = wrapperElm.current!.offsetWidth - 2;
      canvasElm.current!.height = wrapperElm.current!.offsetHeight - 2;
    }
  }, [canvasElm, wrapperElm]);

  useEffect(() => {
    if (canvasElm.current) {
      const ctx = canvasElm.current.getContext('2d');
      drawCanvasGrid(ctx!);
    }
  }, [canvasElm]);

  return (
    <section ref={wrapperElm} className='view-opts'>
      <canvas ref={canvasElm} />
    </section>
  );
};

export default ViewOperations;
