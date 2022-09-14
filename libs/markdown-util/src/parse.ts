import { fromMarkdown as fm } from 'mdast-util-from-markdown'
import { toMarkdown as tm } from 'mdast-util-to-markdown'
import type { Content, Root, YAML } from 'mdast'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'


export type { Root, Image, Heading, YAML, Paragraph, Text } from 'mdast'

/**
 * 解析 markdown 文本为 ast
 * @param content
 * @returns
 */
export function fromMarkdown(content: string): Root {
  return fm(content, {
    extensions: [frontmatter(['yaml']), gfm()],
    mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()],
  })
}

/**
 * 将 markdown ast 转换为文本
 * @param ast
 * @returns
 */
export function toMarkdown(ast: Content | Root): string {
  return tm(ast, {
    extensions: [frontmatterToMarkdown(['yaml']), gfmToMarkdown()],
  })
}
