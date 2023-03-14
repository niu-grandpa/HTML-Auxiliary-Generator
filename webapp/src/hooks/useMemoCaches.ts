export function useMemoCaches() {
  const memo = new Map<string, any>();
  return {
    get(key: any, cb: (cache: any) => any) {
      key = JSON.stringify(key);
      if (memo.has(key)) {
        const cache = memo.get(key);
        cb(cache);
        return true;
      }
      return false;
    },
    set(key: any, value: any) {
      memo.set(JSON.stringify(key), value);
    },
  };
}
