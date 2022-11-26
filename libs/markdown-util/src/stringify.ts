import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'
import { Root } from './utils'

/**
 * 将一段 markdown ast 序列化为 html
 * @param node
 * @returns
 */
export function stringify(node: Root): string {
  return toHtml(toHast(node)!)
}
