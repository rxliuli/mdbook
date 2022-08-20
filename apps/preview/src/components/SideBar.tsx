import classNames from 'classnames'
import css from './SideBar.module.css'

export interface ISideBarItem {
  id: string
  title: string
}

export function SideBar(props: { list: ISideBarItem[]; active?: string; onClick?(item: ISideBarItem): void }) {
  return (
    <nav className={css.SideBar}>
      <ul className={css.list}>
        {props.list.map((item) => (
          <li
            key={item.id}
            className={classNames({
              [css.active]: item.id === props.active,
            })}
            onClick={() => props.onClick?.(item)}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </nav>
  )
}
