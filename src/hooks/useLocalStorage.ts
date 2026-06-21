import { useState, useCallback } from 'react'

/**
 * Generic hook that persists state in localStorage.
 * Mirrors the useState API — the setter accepts a value or an updater function.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Silently ignore quota errors in private-browsing mode
        }
        return next
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
