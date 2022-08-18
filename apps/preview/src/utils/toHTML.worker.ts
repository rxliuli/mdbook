import { expose } from 'comlink'
import { stringify, fromMarkdown } from '@liuli-util/markdown-util'

export function toHTML(s: string) {
  return stringify(fromMarkdown(s))
}

expose(toHTML)
