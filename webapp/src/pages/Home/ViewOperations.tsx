import React from 'react';
import { useEffect, useRef } from 'react';
import { transform, generate } from '../../core';
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
    const canvas = canvasElm.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawCanvasGrid(ctx);
  }, [canvasElm]);

  return (
    <section ref={wrapperElm} className='view-opts'>
      <canvas ref={canvasElm} />
    </section>
  );
};

export default ViewOperations;
