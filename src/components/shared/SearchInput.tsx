import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value)
  const debounced = useDebounce(local, debounceMs)

  // Propagate debounced value
  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  // Keep local in sync when parent resets
  useEffect(() => {
    setLocal(value)
  }, [value])

  const handleClear = () => {
    setLocal('')
    onChange('')
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      />
      {local && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
