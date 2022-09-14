import { expect, it } from '@jest/globals'
import { stringify } from 'yaml'

it('stringify', () => {
  const r = stringify({ s: ['a', 'b'] })
  expect(r.trim()).not.toBe(r)
})
