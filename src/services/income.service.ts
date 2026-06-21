import type { Income } from '@/types'
import { BaseService } from './base.service'

const STORAGE_KEY = 'ffm_incomes'

class IncomeService extends BaseService<Income> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): Income[] {
    return super.getAll()
  }

  getByMember(memberId: string): Income[] {
    return this.getAll().filter((i) => i.memberId === memberId)
  }

  /** month is 'YYYY-MM' */
  getByMonth(month: string): Income[] {
    return this.getAll().filter((i) => i.date.startsWith(month))
  }

  getTotalByMonth(month: string): number {
    return this.getByMonth(month).reduce((sum, i) => sum + i.amount, 0)
  }

  getByDateRange(startDate: string, endDate: string): Income[] {
    return this.getAll().filter((i) => i.date >= startDate && i.date <= endDate)
  }

  search(query: string): Income[] {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAll()
    return this.getAll().filter(
      (i) =>
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
  }
}

export const incomeService = new IncomeService()
