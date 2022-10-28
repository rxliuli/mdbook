import { visit as unistUtilVisit, Node } from 'unist-util-visit'
import { Parent, Root, YAML } from './parse'
import * as yaml from 'yaml'

/**
 * 遍历 ast 节点
 */
export function visit(node: Node, callback: (node: Node) => void) {
  unistUtilVisit(node, callback)
}

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
  let flag = false
  visit(root, (node) => {
    if (node.type === 'yaml') {
      ;(node as YAML).value = yaml.stringify(meta).trim()
      flag = true
    }
  })
  if (flag) {
    return
  }
  root.children.unshift({
    type: 'yaml',
    value: yaml.stringify(meta).trim(),
  } as YAML)
}

/**
 * 映射一棵 ast 树
 * 注：其中会执行真实的修改操作
 * @param tree
 * @param fn
 * @returns
 */
export function flatMap<T extends Node>(tree: T, fn: (node: Node) => Node[]): T {
  visit(tree, (node) => {
    if ('children' in node) {
      const p = node as Parent
      p.children = p.children.flatMap((node) => fn(flatMap(node, fn))) as any
    }
  })
  return tree
}
