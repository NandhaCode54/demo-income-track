import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Users, TrendingUp, TrendingDown, CreditCard, Target, MoreHorizontal } from 'lucide-react'
import { familyMemberService, incomeService, expenseService, emiService, savingsGoalService } from '@/services'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface SearchResult {
  id: string
  type: 'member' | 'income' | 'expense' | 'emi' | 'goal'
  title: string
  subtitle: string
  amount?: number
  path: string
  color?: string
}

const TYPE_META: Record<SearchResult['type'], { icon: React.ElementType; label: string; color: string }> = {
  member: { icon: Users, label: 'Member', color: '#6366F1' },
  income: { icon: TrendingUp, label: 'Income', color: '#22C55E' },
  expense: { icon: TrendingDown, label: 'Expense', color: '#EF4444' },
  emi: { icon: CreditCard, label: 'EMI', color: '#F97316' },
  goal: { icon: Target, label: 'Goal', color: '#8B5CF6' },
}

function buildResults(query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const results: SearchResult[] = []

  // Members
  familyMemberService.getAll()
    .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((m) => {
      results.push({
        id: m.id,
        type: 'member',
        title: m.name,
        subtitle: `${m.role} · ${m.email}`,
        color: m.color,
        path: '/members',
      })
    })

  // Income
  incomeService.search(q).slice(0, 3).forEach((i) => {
    results.push({
      id: i.id,
      type: 'income',
      title: i.description,
      subtitle: i.category,
      amount: i.amount,
      path: '/income',
    })
  })

  // Expenses
  expenseService.search(q).slice(0, 3).forEach((e) => {
    results.push({
      id: e.id,
      type: 'expense',
      title: e.description,
      subtitle: e.category,
      amount: e.amount,
      path: '/expenses',
    })
  })

  // EMIs
  emiService.getAll()
    .filter((e) => e.loanName.toLowerCase().includes(q) || e.lender.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach((e) => {
      results.push({
        id: e.id,
        type: 'emi',
        title: e.loanName,
        subtitle: e.lender,
        amount: e.emiAmount,
        path: '/emi',
      })
    })

  // Savings Goals
  savingsGoalService.getAll()
    .filter((g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach((g) => {
      results.push({
        id: g.id,
        type: 'goal',
        title: g.name,
        subtitle: g.description || g.status,
        amount: g.targetAmount,
        color: g.color,
        path: '/savings',
      })
    })

  return results
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(buildResults(query))
      setActiveIndex(0)
    }, 120)
    return () => clearTimeout(timer)
  }, [query])

  const selectResult = useCallback((result: SearchResult) => {
    navigate(result.path)
    onClose()
    setQuery('')
  }, [navigate, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[activeIndex]) { selectResult(results[activeIndex]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, activeIndex, onClose, selectResult])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-[10vh] z-[101] w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members, income, expenses, EMIs, goals…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!query && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Start typing to search your family data…</p>
                  <p className="text-xs text-muted-foreground mt-1">Members · Income · Expenses · EMIs · Goals</p>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term.</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map((result, index) => {
                    const meta = TYPE_META[result.type]
                    const IconComp = meta.icon
                    const isActive = index === activeIndex

                    return (
                      <button
                        key={result.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectResult(result)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-accent' : 'hover:bg-muted/50',
                        )}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${result.color ?? meta.color}20` }}
                        >
                          <IconComp className="h-4 w-4" style={{ color: result.color ?? meta.color }} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {result.amount !== undefined && (
                            <span className={`text-xs font-semibold ${result.type === 'income' ? 'text-green-500' : result.type === 'expense' ? 'text-red-500' : 'text-foreground'}`}>
                              {formatCurrency(result.amount)}
                            </span>
                          )}
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[9px]">↑↓</kbd>
                  Navigate
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[9px]">↵</kbd>
                  Select
                </span>
                {results.length > 0 && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
