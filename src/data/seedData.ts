import { v4 as uuidv4 } from 'uuid'
import { format, subMonths, subDays } from 'date-fns'
import type {
  FamilyMember,
  Income,
  Expense,
  EMI,
  Budget,
  SavingsGoal,
} from '@/types'
import {
  familyMemberService,
  incomeService,
  expenseService,
  emiService,
  budgetService,
  savingsGoalService,
} from '@/services'
import { getMonthKey } from '@/utils/formatters'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

const now = new Date()
const thisMonth = getMonthKey(now)
const lastMonth = getMonthKey(subMonths(now, 1))
const twoMonthsAgo = getMonthKey(subMonths(now, 2))

const nowIso = now.toISOString()

// ---------------------------------------------------------------------------
// Family Members
// ---------------------------------------------------------------------------
const MEMBERS: Omit<FamilyMember, 'createdAt' | 'updatedAt'>[] = [
  {
    id: uuidv4(),
    name: 'Rajesh Kumar',
    avatar: 'RK',
    role: 'Parent',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    monthlyIncome: 120000,
    color: '#6366F1',
  },
  {
    id: uuidv4(),
    name: 'Priya Kumar',
    avatar: 'PK',
    role: 'Spouse',
    email: 'priya.kumar@email.com',
    phone: '+91 98765 43211',
    monthlyIncome: 65000,
    color: '#EC4899',
  },
  {
    id: uuidv4(),
    name: 'Arjun Kumar',
    avatar: 'AK',
    role: 'Child',
    email: 'arjun.kumar@email.com',
    phone: '+91 98765 43212',
    monthlyIncome: 0,
    color: '#22C55E',
  },
  {
    id: uuidv4(),
    name: 'Kavya Kumar',
    avatar: 'KK',
    role: 'Child',
    email: 'kavya.kumar@email.com',
    phone: '+91 98765 43213',
    monthlyIncome: 45000,
    color: '#F97316',
  },
]

// ---------------------------------------------------------------------------
// Income records (last 3 months)
// ---------------------------------------------------------------------------
function buildIncomes(memberIds: string[]): Omit<Income, 'createdAt' | 'updatedAt'>[] {
  const [dadId, momId, , daughterId] = memberIds
  return [
    // This month
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Salary',
      amount: 120000,
      description: 'Monthly salary – TechCorp India Ltd',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Salary',
      amount: 65000,
      description: 'Monthly salary – Delhi Public School',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: daughterId,
      category: 'Salary',
      amount: 45000,
      description: 'Monthly salary – Infosys BPO',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    // Last month
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Salary',
      amount: 120000,
      description: 'Monthly salary – TechCorp India Ltd',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Freelance',
      amount: 25000,
      description: 'Website development project – StartupXYZ',
      date: isoDate(subDays(subMonths(now, 1), 10)),
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Salary',
      amount: 65000,
      description: 'Monthly salary – Delhi Public School',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: daughterId,
      category: 'Salary',
      amount: 45000,
      description: 'Monthly salary – Infosys BPO',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    // Two months ago
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Salary',
      amount: 120000,
      description: 'Monthly salary – TechCorp India Ltd',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Salary',
      amount: 65000,
      description: 'Monthly salary – Delhi Public School',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Bonus',
      amount: 30000,
      description: 'Annual performance bonus – Q2',
      date: isoDate(subDays(subMonths(now, 2), 5)),
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: daughterId,
      category: 'Salary',
      amount: 45000,
      description: 'Monthly salary – Infosys BPO',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Freelance',
      amount: 8000,
      description: 'Private tuition fees – April batch',
      date: isoDate(subDays(subMonths(now, 2), 15)),
      isRecurring: false,
    },
  ]
}

// ---------------------------------------------------------------------------
// Expense records
// ---------------------------------------------------------------------------
function buildExpenses(memberIds: string[]): Omit<Expense, 'createdAt' | 'updatedAt'>[] {
  const [dadId, momId, sonId, daughterId] = memberIds
  return [
    // This month
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Housing',
      amount: 25000,
      description: 'Monthly house rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      notes: 'Paid via NEFT',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Food & Dining',
      amount: 12000,
      description: 'Monthly grocery & vegetables',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
      notes: 'Big Basket + local market',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Utilities',
      amount: 3500,
      description: 'Electricity + internet + gas bill',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 7)),
      notes: '',
      isRecurring: true,
      recurringDay: 7,
    },
    {
      id: uuidv4(),
      memberId: sonId,
      category: 'Education',
      amount: 8000,
      description: 'College semester fees',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 10)),
      notes: 'Engineering college – 3rd year',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: daughterId,
      category: 'Transportation',
      amount: 4500,
      description: 'Monthly metro pass + Uber rides',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 2)),
      notes: '',
      isRecurring: true,
      recurringDay: 2,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Healthcare',
      amount: 2800,
      description: 'Doctor consultation + medicines',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 12)),
      notes: "Priya's routine health check-up",
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Insurance',
      amount: 5000,
      description: 'LIC premium monthly instalment',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
      notes: 'Policy no. LIC-234567',
      isRecurring: true,
      recurringDay: 5,
    },
    {
      id: uuidv4(),
      memberId: daughterId,
      category: 'Shopping',
      amount: 6500,
      description: 'Clothes & accessories – Myntra',
      date: isoDate(subDays(now, 8)),
      notes: 'Monthly shopping',
      isRecurring: false,
    },
    // Last month
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Housing',
      amount: 25000,
      description: 'Monthly house rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      notes: '',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Food & Dining',
      amount: 11500,
      description: 'Monthly grocery & vegetables',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 5)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Entertainment',
      amount: 3200,
      description: 'OTT subscriptions + movie tickets',
      date: isoDate(subDays(subMonths(now, 1), 12)),
      notes: 'Netflix + Prime + PVR',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Travel',
      amount: 18000,
      description: 'Weekend trip to Goa – family',
      date: isoDate(subDays(subMonths(now, 1), 20)),
      notes: 'Hotel + flights + food',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Personal Care',
      amount: 3500,
      description: 'Salon & spa',
      date: isoDate(subDays(subMonths(now, 1), 18)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Investment',
      amount: 10000,
      description: 'SIP – HDFC Balanced Advantage Fund',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
      notes: 'Monthly SIP auto-debit',
      isRecurring: true,
      recurringDay: 10,
    },
    // Two months ago
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Housing',
      amount: 25000,
      description: 'Monthly house rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      notes: '',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: sonId,
      category: 'Education',
      amount: 12000,
      description: 'Coaching class fees – JEE Advanced prep',
      date: isoDate(subDays(subMonths(now, 2), 3)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: momId,
      category: 'Food & Dining',
      amount: 13000,
      description: 'Monthly grocery & dining out',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 5)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: dadId,
      category: 'Gifts',
      amount: 5000,
      description: "Birthday gift for Rajesh's mother",
      date: isoDate(subDays(subMonths(now, 2), 8)),
      notes: 'Gold coin + sweets',
      isRecurring: false,
    },
  ]
}

// ---------------------------------------------------------------------------
// EMIs
// ---------------------------------------------------------------------------
function buildEMIs(memberIds: string[]): Omit<EMI, 'createdAt' | 'updatedAt'>[] {
  const [dadId, momId] = memberIds
  return [
    {
      id: uuidv4(),
      memberId: dadId,
      loanName: 'Home Loan',
      lender: 'HDFC Bank',
      totalAmount: 5000000,
      emiAmount: 45000,
      totalMonths: 240,
      remainingMonths: 192,
      dueDate: 5,
      startDate: isoDate(subMonths(now, 48)),
      interestRate: 8.5,
      status: 'Active',
      notes: 'Fixed rate – review in 2026',
    },
    {
      id: uuidv4(),
      memberId: dadId,
      loanName: 'Car Loan',
      lender: 'SBI',
      totalAmount: 800000,
      emiAmount: 14500,
      totalMonths: 60,
      remainingMonths: 38,
      dueDate: 10,
      startDate: isoDate(subMonths(now, 22)),
      interestRate: 9.2,
      status: 'Active',
      notes: 'Honda City – 2023 model',
    },
    {
      id: uuidv4(),
      memberId: momId,
      loanName: 'Personal Loan',
      lender: 'ICICI Bank',
      totalAmount: 300000,
      emiAmount: 9500,
      totalMonths: 36,
      remainingMonths: 22,
      dueDate: 15,
      startDate: isoDate(subMonths(now, 14)),
      interestRate: 12.0,
      status: 'Active',
      notes: 'Home renovation loan',
    },
  ]
}

// ---------------------------------------------------------------------------
// Budgets (current month)
// ---------------------------------------------------------------------------
function buildBudgets(): Omit<Budget, 'createdAt' | 'updatedAt'>[] {
  return [
    { id: uuidv4(), category: 'Food & Dining', monthlyLimit: 15000, month: thisMonth },
    { id: uuidv4(), category: 'Transportation', monthlyLimit: 6000, month: thisMonth },
    { id: uuidv4(), category: 'Entertainment', monthlyLimit: 5000, month: thisMonth },
    { id: uuidv4(), category: 'Shopping', monthlyLimit: 8000, month: thisMonth },
    { id: uuidv4(), category: 'Healthcare', monthlyLimit: 5000, month: thisMonth },
    { id: uuidv4(), category: 'Utilities', monthlyLimit: 5000, month: thisMonth },
    { id: uuidv4(), category: 'Education', monthlyLimit: 15000, month: thisMonth },
  ]
}

// ---------------------------------------------------------------------------
// Savings Goals
// ---------------------------------------------------------------------------
function buildGoals(memberIds: string[]): Omit<SavingsGoal, 'createdAt' | 'updatedAt'>[] {
  const [dadId] = memberIds
  return [
    {
      id: uuidv4(),
      name: 'Family Vacation – Europe',
      targetAmount: 300000,
      currentAmount: 85000,
      targetDate: isoDate(new Date(now.getFullYear() + 1, 5, 30)),
      icon: '✈️',
      color: '#6366F1',
      status: 'Active',
      description: 'Family trip to Europe – Paris, Rome, Amsterdam',
      memberId: dadId,
    },
    {
      id: uuidv4(),
      name: 'Emergency Fund',
      targetAmount: 500000,
      currentAmount: 210000,
      targetDate: isoDate(new Date(now.getFullYear() + 1, 11, 31)),
      icon: '🛡️',
      color: '#22C55E',
      status: 'Active',
      description: '6-month expense buffer for the family',
    },
    {
      id: uuidv4(),
      name: "Arjun's Higher Education",
      targetAmount: 1000000,
      currentAmount: 350000,
      targetDate: isoDate(new Date(now.getFullYear() + 3, 6, 1)),
      icon: '🎓',
      color: '#F97316',
      status: 'Active',
      description: 'MS/MBA fund for Arjun',
    },
  ]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Seeds all localStorage data if the family members store is empty. */
export function seedData(): void {
  // Guard: only seed once
  const existingMembers = familyMemberService.getAll()
  if (existingMembers.length > 0) return

  const ts = nowIso

  // Insert members and collect their real IDs
  const insertedMembers = MEMBERS.map((m) =>
    familyMemberService.create(m as Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>),
  )
  const memberIds = insertedMembers.map((m) => m.id)

  // Income
  buildIncomes(memberIds).forEach((i) => incomeService.create(i))

  // Expenses
  buildExpenses(memberIds).forEach((e) => expenseService.create(e))

  // EMIs
  buildEMIs(memberIds).forEach((e) => emiService.create(e))

  // Budgets — use direct localStorage to preserve the month value
  buildBudgets().forEach((b) => budgetService.create(b))

  // Goals
  buildGoals(memberIds).forEach((g) => savingsGoalService.create(g))
}

/** Clears all app data from localStorage. */
export function clearAllData(): void {
  familyMemberService.clear()
  incomeService.clear()
  expenseService.clear()
  emiService.clear()
  budgetService.clear()
  savingsGoalService.clear()
  localStorage.removeItem('ffm_settings')
}
