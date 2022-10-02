import { visit as unistUtilVisit, Node } from 'unist-util-visit'
import { Root, YAML } from './parse'
import * as yaml from 'yaml'

/**
 * 遍历 ast 节点
 */
export function visit(node: Node, callback: (node: Node) => void) {
  unistUtilVisit(node, callback)
}

export { remove } from 'unist-util-remove'
export { map } from 'unist-util-map'

/**
 * 获取 markdown 的 yaml 元数据
 * @param root
 * @returns
 */
export function getYamlMeta<T>(root: Root): T {
  let metaStr: string = ''
  visit(root, (node) => {
    if (node.type === 'yaml') {
      metaStr = (node as YAML).value
    }
  })
  return yaml.parse(metaStr)
}

/**
 * 设置 markdown 的 yaml 元数据
 * @param root
 * @returns
 */
export function setYamlMeta(root: Root, meta: any) {
  visit(root, (node) => {
    if (node.type === 'yaml') {
      ;(node as YAML).value = yaml.stringify(meta).trim()
    }
  })
}
