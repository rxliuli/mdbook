import { chunk } from 'lodash-es'
import React, { useEffect, useRef } from 'react'

export const HTMLViewer = React.memo((props: { children: string }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const parser = new DOMParser()
    const dom = parser.parseFromString(props.children, 'text/html')
    const list = chunk(dom.body.children, 50)

    function f(i: number) {
      if (i === list.length) {
        return
      }
      if (i === 0) {
        contentRef.current!.replaceWith(...list[i])
      } else {
        contentRef.current!.append(...list[i])
      }
      requestAnimationFrame(() => f(i + 1))
    }
    f(0)
  }, [props.children])
  return <div ref={contentRef}></div>
})
