import css from './SideBar.module.css'

export interface ISideBarItem {
  id: string
  title: string
}

export function SideBar(props: { list: ISideBarItem[]; onClick?(item: ISideBarItem): void }) {
  return (
    <nav className={css.SideBar}>
      <ul className={css.list}>
        {props.list.map((item) => (
          <li key={item.id} onClick={() => props.onClick?.(item)}>
            {item.title}
          </li>
        ))}
      </ul>
    </nav>
  )
}
