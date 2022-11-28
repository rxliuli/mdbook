// import { toHtml } from 'hast-util-to-html'
// import { fromMarkdown } from 'mdast-util-from-markdown'
// import { gfmFromMarkdown } from 'mdast-util-gfm'
// import { toHast } from 'mdast-util-to-hast'
// import { gfm } from 'micromark-extension-gfm'

// const s = '## Hello **World**!'
// const root = fromMarkdown(s, {
//   extensions: [gfm()],
//   mdastExtensions: [gfmFromMarkdown()],
// })
// const r = toHtml(toHast(root)!)
// console.log(r)

// import { fromMarkdown as fm, Options as FmOptions } from 'mdast-util-from-markdown'
// import { Options as TmOptions, toMarkdown as tm } from 'mdast-util-to-markdown'
// import type { Content, Root } from 'mdast'
// import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
// import { frontmatter } from 'micromark-extension-frontmatter'
// import { gfm } from 'micromark-extension-gfm'
// import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
// import { toHast } from 'mdast-util-to-hast'
// import { toHtml as hastToHtml } from 'hast-util-to-html'

// /**
//  * 解析 markdown 文本为 ast
//  * @param content
//  * @returns
//  */
// export function fromMarkdown(content: string, options?: FmOptions): Root {
//   return fm(content, {
//     ...options,
//     extensions: [frontmatter(['yaml']), gfm()].concat(options?.extensions ?? []),
//     mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()].concat(options?.mdastExtensions ?? []),
//   })
// }

// /**
//  * 将 markdown ast 转换为文本
//  * @param ast
//  * @returns
//  */
// export function toMarkdown(ast: Content | Root, options?: TmOptions): string {
//   return tm(ast, {
//     ...options,
//     extensions: [frontmatterToMarkdown(['yaml']), gfmToMarkdown()].concat(options?.extensions ?? []),
//   })
// }

// /**
//  * 将一段 markdown ast 序列化为 html
//  * @param node
//  * @returns
//  */
// export function toHtml(node: Root): string {
//   return hastToHtml(toHast(node)!)
// }

// const s = '## Hello **World**!'
// const r = toHtml(fromMarkdown(s))
// console.log(r)

// import { Node, visit } from 'unist-util-visit'
// import { fromMarkdown } from '../parse'

// const s = '## Hello **World**!'
// const root = fromMarkdown(s)
// visit(root, (node: Node) => {
//   console.log(node.type)
// })

// import { Node, Parent } from 'unist'
// import { Strong } from 'mdast'
// import { visit } from 'unist-util-visit'
// import { fromMarkdown, toMarkdown } from '../parse'

// const s = '## Hello **World**!'
// const root = fromMarkdown(s)
// visit(root, (node: Node) => {
//   if ('children' in (node as any)) {
//     const p = node as Parent
//     p.children = p.children.flatMap((item) => (item.type === 'strong' ? (item as Strong).children : [item]))
//   }
// })
// console.log(toMarkdown(root)) // ## Hello World!

// import { Parent } from 'mdast'
// import { Node } from 'unist'

// /**
//  * 映射一棵 ast 树
//  * 注：其中会执行真实的修改操作
//  * @param tree
//  * @param fn
//  * @returns
//  */
// export function flatMap<T extends Node>(tree: T, fn: (node: Node) => Node[]): T {
//   function transform(node: Node): Node[] {
//     if ('children' in node) {
//       const p = node as unknown as Parent
//       p.children = p.children.flatMap((item) => transform(item)) as any
//     }
//     return fn(node)
//   }
//   return transform(tree)[0] as T
// }

// import { fromMarkdown, toMarkdown } from '../parse'
// import { flatMap } from '../utils'
// import { Strong } from 'mdast'

// const s = '## Hello **World**!'
// const root = fromMarkdown(s)
// flatMap(root, (item) => (item.type === 'strong' ? (item as Strong).children : [item]))
// console.log(toMarkdown(root)) // ## Hello World!

// import { fromMarkdown, toMarkdown } from '../parse'
// import { Image } from 'mdast'
// import { selectAll } from 'unist-util-select'

// const s = `
// ![test](resources/aaefd6438fcd48d68f62fc2478f1f857.png)
// ![1669384280333.png](https://lh3.googleusercontent.com/pw/AL9nZEUmvKBtRxGeG-J-0oVDVmdZccu0E0_HiDHaMPlvWBLp1v2wjaA152s9FxkIRFZROAChN-tYgimcK-ZYBFD_KGya40RzSKfDTVJqvoXjg5CsBmAaJPurSPdDmaDm6Bcunj4IxL_YPBnwtH0h7XdwaUxN=w1600-h1200-no)
// `.trim()
// const root = fromMarkdown(s)
// ;(selectAll('image', root) as Image[])
//   .filter((item) => item.url.startsWith('https://lh3.googleusercontent.com/pw/'))
//   .forEach((item) => (item.url = `https://image-proxy.rxliuli.com/?url=${item.url}`))
// console.log(toMarkdown(root))

// import { Root, YAML } from 'mdast'
// import { select } from 'unist-util-select'
// import * as yaml from 'yaml'

// /**
//  * 获取 markdown 的 yaml 元数据
//  * @param root
//  * @returns
//  */
// export function getYamlMeta<T>(root: Root): T {
//   const r = select('yaml', root)
//   return yaml.parse(r ? (r as YAML).value : '')
// }

// /**
//  * 设置 markdown 的 yaml 元数据
//  * @param root
//  * @returns
//  */
// export function setYamlMeta(root: Root, meta: any) {
//   const r = select('yaml', root) as YAML
//   if (r) {
//     r.value = yaml.stringify(meta).trim()
//   } else {
//     root.children.unshift({
//       type: 'yaml',
//       value: yaml.stringify(meta).trim(),
//     } as YAML)
//   }
// }

// import { fromMarkdown, toMarkdown } from '../parse'
// import { getYamlMeta, setYamlMeta } from '../utils'

// const s = `
// ---
// layout: post
// title: 2. Importing and exporting notes
// abbrlink: 2ba8366ac77c4a93b9eb7595d1343eb6
// tags: []
// date: 1667644025956
// updated: 1667644025956
// ---
// `.trim()
// interface HexoMeta {
//   layout: string
//   title: string
//   abbrlink: string
//   tags: string[]
//   date: number
//   updated: number
// }
// interface HugoMeta {
//   title: string
//   slug: string
//   tags: string[]
//   date: string
//   lastmod: string
// }
// const root = fromMarkdown(s)
// const meta = getYamlMeta(root) as HexoMeta
// setYamlMeta(root, {
//   title: meta.title,
//   slug: meta.abbrlink,
//   tags: meta.tags,
//   date: new Date(meta.date).toISOString(),
//   lastmod: new Date(meta.updated).toISOString(),
// } as HugoMeta)
// console.log(toMarkdown(root))

// import { Strong, Text } from 'mdast'
// import { fromMarkdown } from '../parse'
// import { toHtml } from '../stringify'
// import { flatMap } from '../utils'

// const s = `**真没想到我这么快就要死了，** 她有些自暴自弃地想着。`
// const root = fromMarkdown(s)

// flatMap(root, (item, i, p) => {
//   if (item.type === 'strong') {
//     const v = item as Strong
//     const next = p!.children[i + 1]
//     const s = (v.children[0] as Text).value
//     if (s) {
//       const last = s.slice(s.length - 1)
//       if (next && next.type === 'text' && ['，', '。', '？', '！', '〉'].includes(last) && next.value.startsWith(' ')) {
//         next.value = next.value.trim()
//       }
//     }
//   }
//   return [item]
// })
// console.log(toHtml(root))

// import { fromMarkdown, toMarkdown } from '../parse'
// import { Image } from 'mdast'
// import { selectAll } from 'unist-util-select'
// import { Extension } from 'mdast-util-from-markdown'

const s = `
// ![test](resources/aaefd6438fcd48d68f62fc2478f1f857.png)
// ![1669384280333.png](https://lh3.googleusercontent.com/pw/AL9nZEUmvKBtRxGeG-J-0oVDVmdZccu0E0_HiDHaMPlvWBLp1v2wjaA152s9FxkIRFZROAChN-tYgimcK-ZYBFD_KGya40RzSKfDTVJqvoXjg5CsBmAaJPurSPdDmaDm6Bcunj4IxL_YPBnwtH0h7XdwaUxN=w1600-h1200-no)
// `.trim()
// function googleImageProxyFromMarkdown(): Extension {
//   return {
//     transforms: [
//       (root) => {
//         ;(selectAll('image', root) as Image[])
//           .filter((item) => item.url.startsWith('https://lh3.googleusercontent.com/pw/'))
//           .forEach((item) => (item.url = `https://image-proxy.rxliuli.com/?url=${item.url}`))
//       },
//     ],
//   }
// }
// const root = fromMarkdown(s, {
//   mdastExtensions: [googleImageProxyFromMarkdown()],
// })
// console.log(toMarkdown(root))

import { fromMarkdown, toMarkdown } from '../parse'
import { Image } from 'mdast'
import { Options } from 'mdast-util-to-markdown'

function googleImageProxyToMarkdown(): Options {
  return {
    handlers: {
      image(node) {
        const l = node as Image
        if (l.url.startsWith('https://lh3.googleusercontent.com/pw/')) {
          l.url = `https://image-proxy.rxliuli.com/?url=${l.url}`
        }
        return `![${l.alt}](${l.url})`
      },
    },
  }
}
const root = fromMarkdown(s)
console.log(
  toMarkdown(root, {
    extensions: [googleImageProxyToMarkdown()],
  }),
)
