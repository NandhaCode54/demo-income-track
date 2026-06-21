import type { SavingsGoal } from '@/types'
import { BaseService } from './base.service'

const STORAGE_KEY = 'ffm_savings_goals'

class SavingsGoalService extends BaseService<SavingsGoal> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): SavingsGoal[] {
    return super.getAll()
  }

  getActive(): SavingsGoal[] {
    return this.getAll().filter((g) => g.status === 'Active')
  }

  /**
   * Adds a contribution to a goal's currentAmount.
   * Automatically marks the goal as Completed if currentAmount reaches targetAmount.
   */
  addContribution(goalId: string, amount: number): SavingsGoal | null {
    const goal = this.getById(goalId)
    if (!goal) return null
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    const status: SavingsGoal['status'] =
      newAmount >= goal.targetAmount ? 'Completed' : goal.status
    return this.update(goalId, { currentAmount: newAmount, status })
  }

  /** Sum of currentAmount across all goals */
  getTotalSaved(): number {
    return this.getAll().reduce((sum, g) => sum + g.currentAmount, 0)
  }
}

export const savingsGoalService = new SavingsGoalService()
