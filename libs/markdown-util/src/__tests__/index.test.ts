import { expect, it } from 'vitest'
import { fromMarkdown, toMarkdown, YAML } from '../parse'
import { stringify } from '../stringify'
import { getYamlMeta, setYamlMeta, visit } from '../utils'

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

it('update yaml', () => {
  const str = `
---
title: hello world
date: 2022-08-11
---

content
  `.trim()
  const root = fromMarkdown(str)

  const meta = getYamlMeta<{ title: string; date: string }>(root)

  expect(meta).toEqual({ title: 'hello world', date: '2022-08-11' })
  const title = 'hello'
  const date = new Date().toLocaleDateString()
  meta.title = title
  setYamlMeta(root, { title, date })
  expect(getYamlMeta(root)).toEqual({ title, date })

  const r = toMarkdown(root)
  expect(r.includes(title)).toBeTruthy()
  expect(r.includes(date)).toBeTruthy()
})

it('set yaml', () => {
  const root = fromMarkdown('# hello')
  const meta = { name: 'liuli', age: 17 }
  setYamlMeta(root, meta)
  const r = getYamlMeta(root)
  expect(r).deep.eq(meta)
})
