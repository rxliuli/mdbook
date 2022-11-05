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
