/**
 * 创建文件列表树的根节点key，且其后代也应用该key，由它开始自增
 * @returns {() => number}
 */
export function createRootKey(): () => number {
  const base = 1013;
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDay();

  let num = 0;

  return () => {
    let timestamp = y + m + d + date.getHours() + date.getMinutes() + date.getSeconds();
    return (timestamp + ++num) % base;
  };
}
