import { ProcessTreeDataNode } from '../core/type';

export type NodeType = ProcessTreeDataNode | null | undefined;
export type NodeInfo = { key: string; node: NodeType };
