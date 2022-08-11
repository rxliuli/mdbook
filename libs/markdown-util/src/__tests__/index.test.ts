import { fromMarkdown, toMarkdown, YAML } from '../parse.js'
import { stringify } from '../stringify.js'
import { it, expect } from '@jest/globals'
import { visit } from '../utils.js'

it('basic', () => {
  const str = '## Hello **World**!'
  const ast = fromMarkdown(str)
  expect(toMarkdown(ast).trim()).toBe(str)
  const res = stringify(ast)
  expect(res).toBe('<h2>Hello <strong>World</strong>!</h2>')
})

it('yaml', () => {
  const str = `
---
title: hello world
date: 2022-08-11
---

content
`.trim()
  const root = fromMarkdown(str)
  let meta: string = ''
  visit(root, (node) => {
    if (node.type === 'yaml') {
      meta = (node as YAML).value
    }
    console.log(node.type)
  })
  expect(stringify(root)).toBe('<p>content</p>')
  expect(meta).toBe('title: hello world\ndate: 2022-08-11')
})
