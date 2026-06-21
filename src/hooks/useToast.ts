import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

// ---------------------------------------------------------------------------
// Module-level singleton store — all useToast() calls share the same queue,
// so toasts triggered in page components appear in the root <Toaster />.
// ---------------------------------------------------------------------------
let _toasts: Toast[] = []
const _subscribers = new Set<() => void>()

function _notify(): void {
  _subscribers.forEach((fn) => fn())
}

function _addToast(message: string, type: ToastType = 'info'): string {
  const id = uuidv4()
  _toasts = [..._toasts, { id, message, type }]
  _notify()
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id)
    _notify()
  }, 4000)
  return id
}

function _removeToast(id: string): void {
  _toasts = _toasts.filter((t) => t.id !== id)
  _notify()
}

// ---------------------------------------------------------------------------

interface UseToastReturn {
  toasts: Toast[]
  toast: (message: string, type?: ToastType) => string
  dismiss: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [, rerender] = useState(0)

  useEffect(() => {
    const listener = () => rerender((n) => n + 1)
    _subscribers.add(listener)
    return () => {
      _subscribers.delete(listener)
    }
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info'): string => _addToast(message, type),
    [],
  )

  const dismiss = useCallback((id: string): void => _removeToast(id), [])

  return { toasts: _toasts, toast, dismiss }
}
