import { useEffect } from 'react'
import type { Theme } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'ffm_theme'
const DEFAULT_THEME: Theme = 'dark'

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeStorage] = useLocalStorage<Theme>(STORAGE_KEY, DEFAULT_THEME)

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeStorage(newTheme)
    applyTheme(newTheme)
  }

  return {
    theme,
    setTheme,
    isDark: resolveTheme(theme) === 'dark',
  }
}
