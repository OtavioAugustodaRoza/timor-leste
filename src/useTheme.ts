import { useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'timor-atlas-theme'

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch { return null }
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme | null>(savedTheme)
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const theme: Theme = preference ?? (systemDark ? 'dark' : 'light')

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(query.matches)
    const sync = (event: StorageEvent) => { if (event.key === KEY) setPreference(savedTheme()) }
    query.addEventListener('change', update)
    window.addEventListener('storage', sync)
    return () => { query.removeEventListener('change', update); window.removeEventListener('storage', sync) }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151e19' : '#f5f1e8')
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try { localStorage.setItem(KEY, next) } catch { /* Theme remains usable without storage. */ }
  }
  return { theme, toggleTheme }
}
