import { chunk } from 'lodash-es'
import { useEffect, useRef } from 'preact/hooks'
import { memo } from 'preact/compat'
import css from './HTMLViewer.module.css'

export const HTMLViewer = memo((props: { children: string }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const parser = new DOMParser()
    const dom = parser.parseFromString(props.children, 'text/html')
    const list = chunk(dom.body.children, 50)
    const box = contentRef.current! as HTMLDivElement
    function f(i: number) {
      if (i === list.length) {
        return
      }
      if (i === 0) {
        box.innerHTML = ''
      }
      box.append(...list[i])
      requestAnimationFrame(() => f(i + 1))
    }
    f(0)
  }, [props.children])
  return <div className={css.HTMLViewer} ref={contentRef}></div>
})
