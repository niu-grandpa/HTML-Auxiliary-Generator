import { TreeDataNode } from 'antd';
import { CSSProperties } from 'react';
import { NodeType } from './runtime-generate';

export type VNode = {
  type: NodeType;
  key: string;
  tag: string;
  children: VNode[];
  content: string;
  actualPos: [number, number];
  props: {
    id: string;
    className: string;
    style: CSSProperties;
    attributes: { name: string; value: string }[];
  } | null;
};

export function createNodeKey(): string {
  return getHash();
}

// 解决复制的节点 key 冲突
export function resolveKeyConflicts(node: TreeDataNode) {
  const newKey = createNodeKey();
  node.key = newKey;
  // @ts-ignore
  node.props['data-drag-vnode-uuid'] = newKey;
  if (node.isLeaf || !node.children?.length) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    resolveKeyConflicts(child);
  }
  return node;
}

/**创建拖动节点——虚拟节点 */
export function createDragVnode(
  key: string,
  type: NodeType,
  tag: string,
  content: string,
  props: VNode['props'],
  actualPos: [number, number],
  children: VNode[]
): VNode {
  return {
    key,
    type,
    tag,
    content,
    props,
    children,
    actualPos,
  };
}

const randomRandomWord = randomWord();
export function getHash() {
  //定义一个时间戳，计算与1970年相差的毫秒数  用来获得唯一时间
  const timestamp = new Date().valueOf();
  const myRandom = randomRandomWord(false, 4, 5);
  const hashcode = getHashCode(myRandom + timestamp.toString());
  return `${myRandom}_${hashcode}`;
}

//产生一个hash值，只有数字，规则和java的hashcode规则相同
function getHashCode(str: string) {
  const BASE_HASH = 1013;
  const HASH_CODE = 5381;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = BASE_HASH * hash + str.charCodeAt(i);
    if (hash > HASH_CODE - 1) hash %= HASH_CODE; //java int溢出则取模
  }
  return hash;
}

//时间戳来自客户端，精确到毫秒，但仍旧有可能在在多线程下有并发，
//尤其hash化后，毫秒数前面的几位都不变化，导致不同日期hash化的值有可能存在相同，
//因此使用下面的随机数函数，在时间戳上加随机数，保证hash化的结果差异会比较大
/*
 ** randomWord 产生任意长度随机字母数字组合
 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 ** 用法  randomWord(false,6);规定位数 flash
 ** randomWord(true,3，6);长度不定，true
 ** arr变量可以把其他字符加入，如以后需要小写字母，直接加入即可
 */
function randomWord() {
  const arr = Array<string>(62);
  let str = '';
  let idx = 0;
  return (randomFlag: boolean, min: number, max: number) => {
    let range = min;
    if (!arr[0]) {
      for (let i = 48; i <= 57; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
      for (let i = 97; i <= 122; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
      for (let i = 65; i <= 90; i++) {
        arr[idx++] = String.fromCharCode(i);
      }
    }
    // 随机产生
    if (randomFlag) {
      range = Math.round(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < range; i++) {
      const pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  };
}
