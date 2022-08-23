import { useReducer } from 'preact/hooks'
import { useAsync, useMount } from 'react-use'
import { bookApi } from '../api/BookApi'
import css from './Navbar.module.css'
import light from '../assets/light.svg?raw'
import dark from '../assets/dark.svg?raw'

type Theme = 'light' | 'dark'
function ThemeToggle() {
  const [theme, toggleTheme] = useReducer<Theme, void>((s) => {
    const r = s === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = r
    return r
  }, (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as Theme)
  useMount(() => {
    document.documentElement.dataset.theme = theme
  })
  return (
    <span
      class={css.themeIcon}
      onClick={() => toggleTheme()}
      dangerouslySetInnerHTML={{ __html: theme === 'light' ? light : dark }}
    />
  )
}

export function Navbar() {
  const meta = useAsync(bookApi.getMetadata)
  return (
    <nav class={css.Navbar}>
      <a href={'/'} class={css.homeLink}>
        {meta.value && meta.value.title}
      </a>
      <ThemeToggle />
    </nav>
  )
}
