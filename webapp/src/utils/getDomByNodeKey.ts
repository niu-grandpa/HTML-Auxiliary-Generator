export const getDomByNodeKey = (uuid: string): HTMLElement => {
  const dom = document.querySelector(
    `[data-drag-vnode-uuid="${uuid}"]`
  )! as HTMLElement;
  return dom;
};
