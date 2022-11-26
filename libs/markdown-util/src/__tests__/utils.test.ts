import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { describe, expect, it } from 'vitest'
import { stringify } from '../stringify'
import { Heading, Paragraph, visit, Image, Text, u, selectAll } from '../utils'

it('visit', () => {
  const ast = fromMarkdown(`# hello
## sub1
## sub2
### sub3
`)
  const list: string[] = []
  visit(ast, (node) => {
    if (node.type === 'heading' && (node as Heading).depth === 2) {
      list.push(
        (node as Heading).children
          .map((v) => toMarkdown(v))
          .join('')
          .trim(),
      )
    }
  })
  expect(list).toEqual(['sub1', 'sub2'])
})

it('images', () => {
  const root = fromMarkdown(`![cover](./cover.png)
  [cover](./test)`)
  const list: string[] = []
  visit(root, (node) => {
    if (node.type === 'image') {
      list.push((node as Image).url)
    }
  })
  expect(list).toEqual(['./cover.png'])
})

it('remove space for strong after', () => {
  const root = fromMarkdown(`**真没想到我这么快就要死了，** 她有些自暴自弃地想着。`)
  expect(stringify(root)).toBe('<p><strong>真没想到我这么快就要死了，</strong> 她有些自暴自弃地想着。</p>')
  visit(root, (item) => {
    if (item.type === 'paragraph') {
      const children = (item as Paragraph).children
      children.forEach((item, i) => {
        if (item.type === 'strong') {
          const next = children[i + 1]
          const s = (item.children[0] as Text).value
          const last = s.slice(s.length - 1)
          console.log(last)
          if (next && next.type === 'text' && ['，', '。', '？', '！'].includes(last) && next.value.startsWith(' ')) {
            next.value = next.value.trim()
          }
        }
      })
    }
  })
  expect(stringify(root)).toBe('<p><strong>真没想到我这么快就要死了，</strong>她有些自暴自弃地想着。</p>')
})

describe('selectAll', () => {
  const root = u('blockquote', [
    u('paragraph', [u('text', 'Alpha')]),
    u('code', 'Charlie'),
    u('paragraph', [u('text', 'Golf')]),
  ])
  it('basic', () => {
    const r = selectAll('text,code', root)
    expect(r.length).eq(3)
  })
  it('deep', () => {
    const r = selectAll('paragraph,text', root)
    // console.log(r)
    expect(r.length).eq(4)
  })
})
