import css from './App.module.css'
import { useRef, useState } from 'react'
import { useAsyncFn, useMount } from 'react-use'
import { ISideBarItem, SideBar } from './components/SideBar'
import ReactMarkdown from 'react-markdown'

const data: ISideBarItem[] = [
  '001-第一章-许愿.md',
  '002-第二章-幻影.md',
  '003-第三章-麻美观影记-上.md',
  '004-第四章-麻美观影记-下.md',
  '005-第五章-家人.md',
  '006-第六章-军队.md',
  '007-第七章-南方组.md',
  '008-第八章-政与教.md',
  '009-第九章-回声.md',
  '010-第十章-准将.md',
  '011-第十一章-以往生活的残骸.md',
  '012-第十二章-狩猎魔兽的人.md',
  '013-第十三章-不对等的信息.md',
  '014-第十四章-血缘.md',
  '015-第十五章-萨姆萨拉.md',
  '016-第十六章-属于天空的光芒.md',
].map((title) => ({ id: title, title: /^\w+-(.*)\.md$/.exec(title)![1].replace('-', ' ') }))

export function App() {
  const [list, setList] = useState<ISideBarItem[]>([])
  const [content, setContent] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const [, loadById] = useAsyncFn(async (id: string) => {
    const resp = await fetch('http://127.0.0.1:8080/' + id)
    const res = await resp.text()
    setContent(res)
    mainRef.current!.scrollTop = 0
  })
  useMount(async () => {
    setList(data)
    await loadById(data[0].id)
  })
  return (
    <div className={css.App}>
      <SideBar list={list} onClick={(item) => loadById(item.id)} />
      <main ref={mainRef}>
        <div className={css.main}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </main>
    </div>
  )
}
