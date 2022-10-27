import { expect, it } from 'vitest'
import { fromMarkdown, Paragraph, Text, Root } from '../parse'
import { inspect } from 'unist-util-inspect'
import { visit } from '../utils'
import { u } from 'unist-builder'

function join<T>(a: T[], sep: T): T[] {
  const r: T[] = []
  a.forEach((v, i) => {
    if (i !== 0) {
      r.push(sep)
    }
    r.push(v)
  })
  return r
}

function split(str: string, matchs: string[]): string[] {
  let r: string[] = [str]
  for (const m of matchs) {
    r = r.flatMap((s) => join(s.split(m), m).filter((s) => s.length > 0))
  }
  return r
}

it('split', () => {
  expect(split('hello world', ['o', 'l'])).deep.eq(['he', 'l', 'l', 'o', ' w', 'o', 'r', 'l', 'd'])
})

function parseWikiLink(root: Root): Root {
  visit(root, (node) => {
    if (node.type === 'paragraph') {
      const p = node as Paragraph
      p.children = p.children.flatMap((item) => {
        if (item.type !== 'text') {
          return [item]
        }
        const value = (item as Text).value
        const matchs = value.match(/!\[\[.+\]\]/g) ?? []
        return split(value, matchs).map((s) => {
          if (!/!\[\[.+\]\]/.test(s)) {
            return u('text', s) as Text
          }
          return u('wiki', s) as any
        })
      })
    }
  })
  return root
}

it('vite', () => {
  const content = `
Support [[Internal link]]
Support [[Internal link|With custom text]]
Support [[Internal link#heading]]
Support [[Internal link#heading|With custom text]]
Support ![[Document.pdf]]
Support ![[Image.png]]
Support ![[Audio.mp3]]
Support ![[Video.mp4]]
Support ![[Embed note]]
Support ![[Embed note#heading]]
  `.trim()
  const root = fromMarkdown(content)
  parseWikiLink(root)
  console.log(inspect(root))
})
