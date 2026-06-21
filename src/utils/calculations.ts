import type { EMI, Expense, Income, SavingsGoal, CategoryData, MonthlyData } from '@/types'
import { CATEGORY_COLORS } from '@/constants'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addDays } from 'date-fns'

// ---------------------------------------------------------------------------
// EMI calculations
// ---------------------------------------------------------------------------

/** Total amount paid so far on an EMI */
export function calculateEMIPaid(emi: EMI): number {
  const monthsPaid = emi.totalMonths - emi.remainingMonths
  return monthsPaid * emi.emiAmount
}

/** Outstanding principal balance */
export function calculateEMIRemaining(emi: EMI): number {
  return emi.remainingMonths * emi.emiAmount
}

/** Repayment progress as a 0–100 percentage */
export function calculateEMIProgress(emi: EMI): number {
  if (emi.totalMonths === 0) return 0
  const monthsPaid = emi.totalMonths - emi.remainingMonths
  return Math.min(100, Math.round((monthsPaid / emi.totalMonths) * 100))
}

// ---------------------------------------------------------------------------
// Budget calculations
// ---------------------------------------------------------------------------

/** Sum of expenses for a given category and month ('YYYY-MM') */
export function calculateBudgetUsed(
  expenses: Expense[],
  category: string,
  month: string,
): number {
  return expenses
    .filter(
      (e) =>
        e.category === category &&
        e.date.startsWith(month),
    )
    .reduce((sum, e) => sum + e.amount, 0)
}

// ---------------------------------------------------------------------------
// Savings goal calculations
// ---------------------------------------------------------------------------

/** Goal progress as a 0–100 percentage */
export function calculateGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount === 0) return 0
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
}

// ---------------------------------------------------------------------------
// Monthly data
// ---------------------------------------------------------------------------

/**
 * Aggregate income and expense records into per-month summaries,
 * sorted chronologically.
 */
export function calculateMonthlyData(
  incomes: Income[],
  expenses: Expense[],
): MonthlyData[] {
  const map = new Map<string, { income: number; expenses: number }>()

  for (const inc of incomes) {
    const key = inc.date.slice(0, 7) // 'YYYY-MM'
    const entry = map.get(key) ?? { income: 0, expenses: 0 }
    entry.income += inc.amount
    map.set(key, entry)
  }

  for (const exp of expenses) {
    const key = exp.date.slice(0, 7)
    const entry = map.get(key) ?? { income: 0, expenses: 0 }
    entry.expenses += exp.amount
    map.set(key, entry)
  }

  const sortedKeys = Array.from(map.keys()).sort()

  return sortedKeys.map((key) => {
    const { income, expenses: expTotal } = map.get(key)!
    const [year, month] = key.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return {
      month: format(date, 'MMM yyyy'),
      income,
      expenses: expTotal,
      savings: Math.max(0, income - expTotal),
    }
  })
}

// ---------------------------------------------------------------------------
// Category breakdown
// ---------------------------------------------------------------------------

/**
 * Returns per-category expense totals and percentages.
 * If month ('YYYY-MM') is provided, filters to that month.
 */
export function calculateCategoryBreakdown(
  expenses: Expense[],
  month?: string,
): CategoryData[] {
  const filtered = month
    ? expenses.filter((e) => e.date.startsWith(month))
    : expenses

  const totals = new Map<string, number>()
  for (const exp of filtered) {
    totals.set(exp.category, (totals.get(exp.category) ?? 0) + exp.amount)
  }

  const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0)

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
      color:
        CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? '#C9CBCF',
    }))
}

// ---------------------------------------------------------------------------
// EMI due-date helpers
// ---------------------------------------------------------------------------

/** Returns how many days until the next occurrence of dueDay in the current month (or next month if past) */
export function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  let dueDate = new Date(year, month, dueDay)
  if (dueDate < today) {
    // Move to next month
    dueDate = new Date(year, month + 1, dueDay)
  }
  const diff = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, diff)
}

/** Returns active EMIs with a due date within the next `days` days (default 30) */
export function getUpcomingEMIs(emis: EMI[], days: number = 30): EMI[] {
  const today = new Date()
  const cutoff = addDays(today, days)
  return emis.filter((emi) => {
    if (emi.status !== 'Active') return false
    const daysLeft = getDaysUntilDue(emi.dueDate)
    const dueDate = addDays(today, daysLeft)
    return dueDate <= cutoff
  })
}
