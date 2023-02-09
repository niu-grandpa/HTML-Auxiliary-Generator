import React from 'react';
import { useEffect, useRef } from 'react';
import { transformToHTMLString } from '../../core';
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

  useEffect(() => {
    const res = transformToHTMLString({
      tag: 'section',
      on: {
        click: () => {
          console.log(1);
        },
      },
      attributes: {
        className: 'aaa',
      },
      children: [
        {
          tag: 'div',
          children: [
            {
              tag: 'span',
              children: ['标span签'],
            },
            {
              tag: 'span',
              children: ['标span签'],
            },
          ],
        },
        {
          tag: 'p',
          children: ['标p签'],
        },
      ],
    });
    console.log(res);
  }, []);

  return (
    <section ref={wrapperElm} className='view-opts'>
      <canvas ref={canvasElm} />
    </section>
  );
};

export default ViewOperations;
