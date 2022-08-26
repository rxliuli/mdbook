import { useState, useRef } from 'preact/hooks'
import { useAsyncFn, useMount, useToggle } from 'react-use'
import { bookApi } from './api/BookApi'
import { HTMLViewer } from './components/HTMLViewer'
import { ISideBarItem, SideBar } from './components/SideBar'
import css from './App.module.css'
import { Navbar } from './components/Navbar'
import { HomeView } from './components/HomeView'

export function App() {
  const [list, setList] = useState<ISideBarItem[]>([])
  const [content, setContent] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState<string>()
  const [, loadById] = useAsyncFn(async (item: ISideBarItem) => {
    toggleIsHome(false)
    setActive(item.id)
    document.title = item.title
    history.pushState({}, item.title, item.id)
    const text = await bookApi.getById(item.id)
    setContent(text)
    mainRef.current!.scrollTop = 0
  })
  const [isHome, toggleIsHome] = useToggle(true)
  useMount(async () => {
    const list = await bookApi.getChapterList()
    setList(list)
    if (location.pathname) {
      const id = decodeURI(location.pathname).slice(1)
      const findItem = list.find((item) => item.id === id)
      if (findItem) {
        await loadById(findItem)
        toggleIsHome(false)
        return
      }
    }
    toggleIsHome(true)
    // await loadById(list[0])
  })
  return (
    <div className={css.App}>
      <Navbar />
      <SideBar list={list} active={active} onClick={(item) => loadById(item)} />
      <main ref={mainRef}>
        <div className={css.main}>{isHome ? <HomeView /> : <HTMLViewer>{content}</HTMLViewer>}</div>
      </main>
    </div>
  )
}
