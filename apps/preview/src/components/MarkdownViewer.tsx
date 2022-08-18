import { wrap } from 'comlink'
import { useState } from 'react'
import { useAsync } from 'react-use'
import type { toHTML } from '../utils/toHTML.worker'
import ToHTMLWorker from './toHTML.worker?worker'

const asyncToHTML = wrap<typeof toHTML>(new ToHTMLWorker())

export function MarkdownViewer(props: { content: string }) {
  const [s, setS] = useState('')
  useAsync(async () => {
    setS(await asyncToHTML(props.content))
  }, [props.content])
  return <div dangerouslySetInnerHTML={{ __html: s }} />
}
