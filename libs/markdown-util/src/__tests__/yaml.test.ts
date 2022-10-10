import { expect, it } from "vitest";
import { stringify } from 'yaml'

it('stringify', () => {
  const r = stringify({ s: ['a', 'b'] })
  expect(r.trim()).not.toBe(r)
})
