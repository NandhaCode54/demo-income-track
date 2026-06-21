import type { FamilyMember } from '@/types'
import { BaseService } from './base.service'

const STORAGE_KEY = 'ffm_family_members'

class FamilyMemberService extends BaseService<FamilyMember> {
  constructor() {
    super(STORAGE_KEY)
  }

  getAll(): FamilyMember[] {
    return super.getAll()
  }

  getMemberById(id: string): FamilyMember | undefined {
    return this.getById(id)
  }

  getTotalIncome(): number {
    return this.getAll().reduce((sum, member) => sum + member.monthlyIncome, 0)
  }
}

export const familyMemberService = new FamilyMemberService()
