import { Descendant, Node } from 'slate';

export const serializeSlate = (nodes: Descendant[]): string => {
  if (!Array.isArray(nodes)) return '';
  return nodes.map(n => Node.string(n)).join('\n');
};