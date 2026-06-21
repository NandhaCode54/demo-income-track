import type { Expense } from '@/types'
import { BaseService } from './base.service'

const STORAGE_KEY = 'ffm_expenses'

class ExpenseService extends BaseService<Expense> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): Expense[] {
    return super.getAll()
  }

  getByMember(memberId: string): Expense[] {
    return this.getAll().filter((e) => e.memberId === memberId)
  }

  /** month is 'YYYY-MM' */
  getByMonth(month: string): Expense[] {
    return this.getAll().filter((e) => e.date.startsWith(month))
  }

  getByCategory(category: string): Expense[] {
    return this.getAll().filter((e) => e.category === category)
  }

  getTotalByMonth(month: string): number {
    return this.getByMonth(month).reduce((sum, e) => sum + e.amount, 0)
  }

  getTotalByCategory(category: string, month?: string): number {
    const base = this.getByCategory(category)
    const filtered = month ? base.filter((e) => e.date.startsWith(month)) : base
    return filtered.reduce((sum, e) => sum + e.amount, 0)
  }

  getByDateRange(startDate: string, endDate: string): Expense[] {
    return this.getAll().filter((e) => e.date >= startDate && e.date <= endDate)
  }

  search(query: string): Expense[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAll()
    return this.getAll().filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q),
    )
  }
}

export const expenseService = new ExpenseService()
