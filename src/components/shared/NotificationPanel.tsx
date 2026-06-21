import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CreditCard, AlertTriangle, Target, Info, CheckCircle2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { emiService, budgetService, expenseService, savingsGoalService } from '@/services'
import { getDaysUntilDue, calculateBudgetUsed, calculateGoalProgress } from '@/utils/calculations'
import { formatCurrency, getMonthKey } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { AppNotification, NotificationSeverity } from '@/types'

const SEVERITY_META: Record<NotificationSeverity, { color: string; bg: string; icon: React.ElementType }> = {
  error: { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
  warning: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
  success: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  info: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Info },
}

function buildNotifications(): AppNotification[] {
  const notifications: AppNotification[] = []
  const now = new Date().toISOString()
  const month = getMonthKey()

  // ---- EMI due alerts ----
  for (const emi of emiService.getActive()) {
    const days = getDaysUntilDue(emi.dueDate)
    if (days <= 3) {
      notifications.push({
        id: `emi-${emi.id}`,
        type: 'emi',
        severity: 'error',
        title: 'EMI Due Very Soon',
        message: `${emi.loanName} (${formatCurrency(emi.emiAmount)}) is due ${days === 0 ? 'today' : `in ${days} day${days > 1 ? 's' : ''}`}.`,
        link: '/emi',
        createdAt: now,
      })
    } else if (days <= 7) {
      notifications.push({
        id: `emi-${emi.id}`,
        type: 'emi',
        severity: 'warning',
        title: 'Upcoming EMI',
        message: `${emi.loanName} (${formatCurrency(emi.emiAmount)}) is due in ${days} days.`,
        link: '/emi',
        createdAt: now,
      })
    }
  }

  // ---- Budget alerts ----
  const allExpenses = expenseService.getAll()
  for (const budget of budgetService.getByMonth(month)) {
    const used = calculateBudgetUsed(allExpenses, budget.category, month)
    const pct = budget.monthlyLimit > 0 ? (used / budget.monthlyLimit) * 100 : 0
    if (pct >= 100) {
      notifications.push({
        id: `budget-over-${budget.id}`,
        type: 'budget',
        severity: 'error',
        title: 'Budget Exceeded',
        message: `${budget.category} budget exceeded! Spent ${formatCurrency(used)} of ${formatCurrency(budget.monthlyLimit)}.`,
        link: '/budget',
        createdAt: now,
      })
    } else if (pct >= 80) {
      notifications.push({
        id: `budget-warn-${budget.id}`,
        type: 'budget',
        severity: 'warning',
        title: 'Budget Warning',
        message: `${budget.category} is at ${pct.toFixed(0)}% of budget (${formatCurrency(used)} / ${formatCurrency(budget.monthlyLimit)}).`,
        link: '/budget',
        createdAt: now,
      })
    }
  }

  // ---- Savings goal milestones ----
  for (const goal of savingsGoalService.getActive()) {
    const pct = calculateGoalProgress(goal)
    if (pct >= 100) {
      notifications.push({
        id: `goal-done-${goal.id}`,
        type: 'goal',
        severity: 'success',
        title: 'Goal Achieved! 🎉',
        message: `"${goal.name}" has been fully funded with ${formatCurrency(goal.currentAmount)}!`,
        link: '/savings',
        createdAt: now,
      })
    } else if (pct >= 75) {
      notifications.push({
        id: `goal-milestone-${goal.id}`,
        type: 'goal',
        severity: 'info',
        title: 'Goal Milestone',
        message: `"${goal.name}" is ${pct}% funded — just ${formatCurrency(goal.targetAmount - goal.currentAmount)} to go!`,
        link: '/savings',
        createdAt: now,
      })
    }
  }

  return notifications
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export function NotificationPanel({ open, onClose, anchorRef }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const refresh = useCallback(() => {
    setNotifications(buildNotifications())
  }, [])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return
      const target = e.target as Node
      if (anchorRef.current?.contains(target)) return
      const panel = document.getElementById('notification-panel')
      if (panel?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose, anchorRef])

  const visible = notifications.filter((n) => !dismissed.has(n.id))

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
  }

  function dismissAll() {
    setDismissed(new Set(notifications.map((n) => n.id)))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="notification-panel"
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 z-50 w-[360px] max-h-[480px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {visible.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
                  {visible.length}
                </span>
              )}
            </div>
            {visible.length > 0 && (
              <button
                onClick={dismissAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visible.map((notif) => {
                  const meta = SEVERITY_META[notif.severity]
                  const IconComp = notif.type === 'emi' ? CreditCard
                    : notif.type === 'budget' ? AlertTriangle
                    : notif.type === 'goal' ? Target
                    : Info

                  return (
                    <div key={notif.id} className="relative flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
                        <IconComp className={cn('h-4 w-4', meta.color)} />
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <p className={cn('text-xs font-semibold', meta.color)}>{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={() => dismiss(notif.id)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to count unread notifications
export function useNotificationCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => setCount(buildNotifications().length)
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [])

  return count
}
