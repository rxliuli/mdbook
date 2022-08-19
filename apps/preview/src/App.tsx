import css from './App.module.css'
import { useRef, useState } from 'react'
import { useAsyncFn, useMount } from 'react-use'
import { ISideBarItem, SideBar } from './components/SideBar'
import { bookApi } from './api/BookApi'
import { HTMLViewer } from './components/HTMLViewer'

export function App() {
  const [list, setList] = useState<ISideBarItem[]>([])
  const [content, setContent] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const [, loadById] = useAsyncFn(async (id: string) => {
    const text = await bookApi.getById(id)
    setContent(text)
    mainRef.current!.scrollTop = 0
  })
  useMount(async () => {
    const list = await bookApi.getChapterList()
    setList(list)
    await loadById(list[0].id)
  })
  return (
    <div className={css.App}>
      <SideBar list={list} onClick={(item) => loadById(item.id)} />
      <main ref={mainRef}>
        <div className={css.main}>
          <HTMLViewer>{content}</HTMLViewer>
        </div>
      </main>
    </div>
  )
}
