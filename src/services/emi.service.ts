import type { EMI } from '@/types'
import { BaseService } from './base.service'
import { getDaysUntilDue } from '@/utils/calculations'

const STORAGE_KEY = 'ffm_emis'

class EMIService extends BaseService<EMI> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): EMI[] {
    return super.getAll()
  }

  getByMember(memberId: string): EMI[] {
    return this.getAll().filter((e) => e.memberId === memberId)
  }

  getActive(): EMI[] {
    return this.getAll().filter((e) => e.status === 'Active')
  }

  /** EMIs due within the next `days` days (default 30) */
  getUpcoming(days: number = 30): EMI[] {
    return this.getActive().filter((e) => getDaysUntilDue(e.dueDate) <= days)
  }

  /** Sum of emi amounts for all active EMIs */
  getTotalMonthlyEMI(): number {
    return this.getActive().reduce((sum, e) => sum + e.emiAmount, 0)
  }
}

export const emiService = new EMIService()
