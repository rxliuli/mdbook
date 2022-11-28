import { visit as unistUtilVisit, Node } from 'unist-util-visit'
import { Parent, Root, YAML } from 'mdast'
import * as yaml from 'yaml'
import { select } from 'unist-util-select'

export type {
  AlignType,
  ReferenceType,
  Content,
  TopLevelContent,
  BlockContent,
  FrontmatterContent,
  DefinitionContent,
  ListContent,
  TableContent,
  RowContent,
  PhrasingContent,
  StaticPhrasingContent,
  // interface
  BlockContentMap,
  FrontmatterContentMap,
  DefinitionContentMap,
  StaticPhrasingContentMap,
  PhrasingContentMap,
  ListContentMap,
  TableContentMap,
  RowContentMap,
  Parent,
  Literal,
  Root,
  Paragraph,
  Heading,
  ThematicBreak,
  Blockquote,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  HTML,
  Code,
  YAML,
  Definition,
  FootnoteDefinition,
  Text,
  Emphasis,
  Strong,
  Delete,
  InlineCode,
  Break,
  Link,
  Image,
  LinkReference,
  ImageReference,
  Footnote,
  FootnoteReference,
  Resource,
  Association,
  Reference,
  Alternative,
} from 'mdast'
export type { Node } from 'unist'
export { u } from 'unist-builder'
export { select, selectAll } from 'unist-util-select'
export type { Extension as MicromarkSyntaxExtension } from 'micromark-util-types'
export type { Extension as MdastExtension } from 'mdast-util-from-markdown'
export type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown'

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
  const r = select('yaml', root)
  return yaml.parse(r ? (r as YAML).value : '')
}

/**
 * 设置 markdown 的 yaml 元数据
 * @param root
 * @returns
 */
export function setYamlMeta(root: Root, meta: any) {
  const r = select('yaml', root) as YAML
  if (r) {
    r.value = yaml.stringify(meta).trim()
  } else {
    root.children.unshift({
      type: 'yaml',
      value: yaml.stringify(meta).trim(),
    } as YAML)
  }
}

/**
 * 映射一棵 ast 树
 * 注：其中会执行真实的修改操作
 * @param tree
 * @param fn
 * @returns
 */
export function flatMap<T extends Node>(tree: T, fn: (node: Node, i: number, parent?: Parent) => Node[]): T {
  function transform(node: Node, i: number, parent?: Parent): Node[] {
    if ('children' in node) {
      const p = node as unknown as Parent
      p.children = p.children.flatMap((item, i) => transform(item, i, p)) as any
    }
    return fn(node, i, parent)
  }
  return transform(tree, 0, undefined)[0] as T
}
