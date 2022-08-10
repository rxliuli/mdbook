import { expect, describe, it } from '@jest/globals'
import { Image } from '@liuli-util/mdbook-sdk'
import MarkdownIt from 'markdown-it'
// @ts-expect-error
import type { RenderRule } from 'markdown-it/lib/renderer'
// @ts-expect-error
import type Token from 'markdown-it/lib/token'
import parse from 'node-html-parser'
import path from 'path'
import { v4 } from 'uuid'

function each(tokens: Token[], callback: (token: Token) => void | false) {
  tokens.flatMap((token) => {
    const r = callback(token)
    if (r === false || !token.children) {
      return
    }
    each(token.children, callback)
  })
}

function visitByTag(tokens: Token[], tag: string): Token[] {
  const r: Token[] = []
  each(tokens, (token) => {
    if (token.tag === tag) {
      r.push(token)
      return false
    }
  })
  return r
}

function collectImagesLink(list: string[]): MarkdownIt.PluginSimple {
  return (md) => {
    md.renderer.rules.image = (tokens, idx, options, _env, self) => {
      list.push(tokens[idx].attrGet('src')!)
      return self.renderToken(tokens, idx, options)
    }
    return md
  }
}

it('render links', () => {
  const md = new MarkdownIt()
  const str = `
  ![cover](./cover.png)
  [cover](./test)
  `
  const list: string[] = []
  md.use(collectImagesLink(list))
  md.render(str)
  expect(list).toEqual(['./cover.png'])
})

describe('visit', () => {
  const md = new MarkdownIt()
  it('image', () => {
    const tokens = md.parse(
      `![cover](./cover.png)
[cover](./test)`,
      {},
    )
    expect(visitByTag(tokens, 'img').map((item) => item.attrGet('src'))).toEqual(['./cover.png'])
  })
  it('header', () => {
    const tokens = md.parse(
      `# hello
    ## sub1

    ## sub2

    `,
      {},
    )
    console.log(tokens)
    each(tokens, (t) => {
      console.log(t.type)
    })
  })
})

it('header', () => {})
