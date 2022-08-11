import { visit as unistUtilVisit, Node } from 'unist-util-visit'

/**
 * 遍历 ast 节点
 */
export function visit(node: Node, callback: (node: Node) => void) {
  unistUtilVisit(node, callback)
}

export { remove } from 'unist-util-remove'
