import type { Budget, ExpenseCategory } from '@/types'
import { BaseService } from './base.service'

const STORAGE_KEY = 'ffm_budgets'

class BudgetService extends BaseService<Budget> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): Budget[] {
    return super.getAll()
  }

  /** month is 'YYYY-MM' */
  getByMonth(month: string): Budget[] {
    return this.getAll().filter((b) => b.month === month)
  }

  getByCategory(category: string, month: string): Budget | undefined {
    return this.getAll().find(
      (b) => b.category === category && b.month === month,
    )
  }

  /**
   * Creates or updates a budget entry for a category + month.
   * Uses the existing record's id if present so timestamps are preserved.
   */
  upsert(category: string, month: string, limit: number): Budget {
    const existing = this.getByCategory(category, month)
    if (existing) {
      return this.update(existing.id, { monthlyLimit: limit }) as Budget
    }
    return this.create({
      category: category as ExpenseCategory,
      month,
      monthlyLimit: limit,
    })
  }
}

export const budgetService = new BudgetService()
