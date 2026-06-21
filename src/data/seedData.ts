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
const nowIso = now.toISOString()

// Bump this when seed data changes — forces a reseed on next load
const SEED_VERSION = 'v2-family-2024'
const SEED_VERSION_KEY = 'ffm_seed_version'

// ---------------------------------------------------------------------------
// Family Members  (from app screenshot)
// ---------------------------------------------------------------------------
//  1. Nandhakumar M  — Child   | ₹0      | purple  | nandha762003@email.com   | +91 8667873523
//  2. Balaji M       — Child   | ₹35,000 | orange  | balajicofe@email.com     | +91 9344681206
//  3. Ramesh         — Child   | ₹29,000 | yellow  | rm807243@gmail.com       | +91 9159228646
//  4. Rajeshwari M   — Parent  | ₹0      | indigo  | —                        | 9489773523
// ---------------------------------------------------------------------------
const MEMBERS: Omit<FamilyMember, 'createdAt' | 'updatedAt'>[] = [
  {
    id: uuidv4(),
    name: 'Nandhakumar M',
    avatar: 'NM',
    role: 'Child',
    email: 'nandha762003@email.com',
    phone: '+91 8667873523',
    monthlyIncome: 0,
    color: '#8B5CF6', // purple
  },
  {
    id: uuidv4(),
    name: 'Balaji M',
    avatar: 'BM',
    role: 'Child',
    email: 'balajicofe@email.com',
    phone: '+91 9344681206',
    monthlyIncome: 35000,
    color: '#F97316', // orange
  },
  {
    id: uuidv4(),
    name: 'Ramesh',
    avatar: 'R',
    role: 'Child',
    email: 'rm807243@gmail.com',
    phone: '+91 9159228646',
    monthlyIncome: 29000,
    color: '#EAB308', // yellow
  },
  {
    id: uuidv4(),
    name: 'Rajeshwari M',
    avatar: 'RM',
    role: 'Parent',
    email: '',
    phone: '9489773523',
    monthlyIncome: 0,
    color: '#6366F1', // indigo
  },
]

// ---------------------------------------------------------------------------
// Income records (last 3 months)
// ---------------------------------------------------------------------------
function buildIncomes(memberIds: string[]): Omit<Income, 'createdAt' | 'updatedAt'>[] {
  const [, balajiId, rameshId] = memberIds
  return [
    // ---- Current month ----
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Salary',
      amount: 35000,
      description: 'Monthly salary – Balaji M',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      category: 'Salary',
      amount: 29000,
      description: 'Monthly salary – Ramesh',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    // ---- Last month ----
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Salary',
      amount: 35000,
      description: 'Monthly salary – Balaji M',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      category: 'Salary',
      amount: 29000,
      description: 'Monthly salary – Ramesh',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Freelance',
      amount: 8000,
      description: 'Freelance project – web design',
      date: isoDate(subDays(subMonths(now, 1), 10)),
      isRecurring: false,
    },
    // ---- Two months ago ----
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Salary',
      amount: 35000,
      description: 'Monthly salary – Balaji M',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      category: 'Salary',
      amount: 29000,
      description: 'Monthly salary – Ramesh',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      category: 'Bonus',
      amount: 5000,
      description: 'Performance bonus – Q2',
      date: isoDate(subDays(subMonths(now, 2), 5)),
      isRecurring: false,
    },
  ]
}

// ---------------------------------------------------------------------------
// Expense records
// ---------------------------------------------------------------------------
function buildExpenses(memberIds: string[]): Omit<Expense, 'createdAt' | 'updatedAt'>[] {
  const [nandhakumarId, balajiId, rameshId, rajeshwariId] = memberIds
  return [
    // ---- Current month ----
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Education',
      amount: 8000,
      description: 'College semester fees',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
      notes: 'Engineering college tuition',
      isRecurring: true,
      recurringDay: 5,
    },
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Transportation',
      amount: 3000,
      description: 'Monthly bus pass + auto rides',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 2)),
      notes: '',
      isRecurring: true,
      recurringDay: 2,
    },
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Food & Dining',
      amount: 4500,
      description: 'Mess fees + canteen',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 3)),
      notes: 'Monthly hostel mess',
      isRecurring: true,
      recurringDay: 3,
    },
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Shopping',
      amount: 2500,
      description: 'Stationery & books',
      date: isoDate(subDays(now, 6)),
      notes: 'Semester books',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Personal Care',
      amount: 800,
      description: 'Haircut + toiletries',
      date: isoDate(subDays(now, 3)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Food & Dining',
      amount: 4000,
      description: 'Monthly groceries',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 4)),
      notes: 'Supermarket + vegetables',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Entertainment',
      amount: 1500,
      description: 'OTT subscriptions',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      notes: 'Netflix + Hotstar',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Transportation',
      amount: 2500,
      description: 'Fuel + bike maintenance',
      date: isoDate(subDays(now, 5)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Shopping',
      amount: 3000,
      description: 'Clothes – Flipkart',
      date: isoDate(subDays(now, 8)),
      notes: 'Monthly shopping',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Housing',
      amount: 8000,
      description: 'House rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      notes: 'Monthly rent payment',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Utilities',
      amount: 2500,
      description: 'Electricity + water + gas',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 7)),
      notes: '',
      isRecurring: true,
      recurringDay: 7,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Food & Dining',
      amount: 5000,
      description: 'Household groceries',
      date: isoDate(new Date(now.getFullYear(), now.getMonth(), 5)),
      notes: 'Big Basket + local market',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Healthcare',
      amount: 1500,
      description: 'Doctor visit + medicines',
      date: isoDate(subDays(now, 4)),
      notes: 'Monthly health expenses',
      isRecurring: false,
    },
    // ---- Last month ----
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Education',
      amount: 8000,
      description: 'College semester fees',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 5)),
      notes: '',
      isRecurring: true,
      recurringDay: 5,
    },
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Food & Dining',
      amount: 4200,
      description: 'Mess fees + canteen',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 3)),
      notes: '',
      isRecurring: true,
      recurringDay: 3,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Food & Dining',
      amount: 3800,
      description: 'Monthly groceries',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 4)),
      notes: '',
      isRecurring: false,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Housing',
      amount: 8000,
      description: 'House rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      notes: '',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Utilities',
      amount: 2300,
      description: 'Electricity + water + gas',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 7)),
      notes: '',
      isRecurring: true,
      recurringDay: 7,
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      category: 'Transportation',
      amount: 1800,
      description: 'Fuel expenses',
      date: isoDate(subDays(subMonths(now, 1), 10)),
      notes: '',
      isRecurring: false,
    },
    // ---- Two months ago ----
    {
      id: uuidv4(),
      memberId: nandhakumarId,
      category: 'Education',
      amount: 8000,
      description: 'College semester fees',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 5)),
      notes: '',
      isRecurring: true,
      recurringDay: 5,
    },
    {
      id: uuidv4(),
      memberId: rajeshwariId,
      category: 'Housing',
      amount: 8000,
      description: 'House rent',
      date: isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      notes: '',
      isRecurring: true,
      recurringDay: 1,
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      category: 'Travel',
      amount: 6000,
      description: 'Weekend family trip',
      date: isoDate(subDays(subMonths(now, 2), 8)),
      notes: 'Bus + hotel',
      isRecurring: false,
    },
  ]
}

// ---------------------------------------------------------------------------
// EMIs
// ---------------------------------------------------------------------------
function buildEMIs(memberIds: string[]): Omit<EMI, 'createdAt' | 'updatedAt'>[] {
  const [, balajiId, rameshId] = memberIds
  return [
    {
      id: uuidv4(),
      memberId: balajiId,
      loanName: 'Two-Wheeler Loan',
      lender: 'HDFC Bank',
      totalAmount: 80000,
      emiAmount: 3200,
      totalMonths: 24,
      remainingMonths: 18,
      dueDate: 5,
      startDate: isoDate(subMonths(now, 6)),
      interestRate: 10.5,
      status: 'Active',
      notes: 'Honda Activa – 2023',
    },
    {
      id: uuidv4(),
      memberId: rameshId,
      loanName: 'Personal Loan',
      lender: 'SBI Bank',
      totalAmount: 150000,
      emiAmount: 5500,
      totalMonths: 36,
      remainingMonths: 28,
      dueDate: 10,
      startDate: isoDate(subMonths(now, 8)),
      interestRate: 11.5,
      status: 'Active',
      notes: 'Home renovation loan',
    },
    {
      id: uuidv4(),
      memberId: balajiId,
      loanName: 'Mobile Phone EMI',
      lender: 'Bajaj Finance',
      totalAmount: 25000,
      emiAmount: 2100,
      totalMonths: 12,
      remainingMonths: 9,
      dueDate: 15,
      startDate: isoDate(subMonths(now, 3)),
      interestRate: 0,
      status: 'Active',
      notes: 'Samsung Galaxy S24 – 0% interest',
    },
  ]
}

// ---------------------------------------------------------------------------
// Budgets (current month)
// ---------------------------------------------------------------------------
function buildBudgets(): Omit<Budget, 'createdAt' | 'updatedAt'>[] {
  return [
    { id: uuidv4(), category: 'Food & Dining',   monthlyLimit: 15000, month: thisMonth },
    { id: uuidv4(), category: 'Transportation',  monthlyLimit: 8000,  month: thisMonth },
    { id: uuidv4(), category: 'Education',       monthlyLimit: 10000, month: thisMonth },
    { id: uuidv4(), category: 'Entertainment',   monthlyLimit: 3000,  month: thisMonth },
    { id: uuidv4(), category: 'Shopping',        monthlyLimit: 6000,  month: thisMonth },
    { id: uuidv4(), category: 'Housing',         monthlyLimit: 10000, month: thisMonth },
    { id: uuidv4(), category: 'Utilities',       monthlyLimit: 3500,  month: thisMonth },
    { id: uuidv4(), category: 'Healthcare',      monthlyLimit: 3000,  month: thisMonth },
  ]
}

// ---------------------------------------------------------------------------
// Savings Goals
// ---------------------------------------------------------------------------
function buildGoals(memberIds: string[]): Omit<SavingsGoal, 'createdAt' | 'updatedAt'>[] {
  const [nandhakumarId, balajiId] = memberIds
  return [
    {
      id: uuidv4(),
      name: "Nandhakumar's Higher Studies",
      targetAmount: 500000,
      currentAmount: 85000,
      targetDate: isoDate(new Date(now.getFullYear() + 2, 5, 30)),
      icon: '🎓',
      color: '#8B5CF6',
      status: 'Active',
      description: 'MS / MBA fund for Nandhakumar',
      memberId: nandhakumarId,
    },
    {
      id: uuidv4(),
      name: 'Family Emergency Fund',
      targetAmount: 300000,
      currentAmount: 120000,
      targetDate: isoDate(new Date(now.getFullYear() + 1, 11, 31)),
      icon: '🛡️',
      color: '#22C55E',
      status: 'Active',
      description: '6-month expense buffer',
    },
    {
      id: uuidv4(),
      name: 'Family Vacation – Ooty / Kodai',
      targetAmount: 50000,
      currentAmount: 18000,
      targetDate: isoDate(new Date(now.getFullYear(), 11, 20)),
      icon: '✈️',
      color: '#F97316',
      status: 'Active',
      description: 'Year-end family holiday',
      memberId: balajiId,
    },
    {
      id: uuidv4(),
      name: 'New Laptop for Balaji',
      targetAmount: 70000,
      currentAmount: 35000,
      targetDate: isoDate(new Date(now.getFullYear(), 8, 1)),
      icon: '💻',
      color: '#EAB308',
      status: 'Active',
      description: 'MacBook Air / Dell XPS',
      memberId: balajiId,
    },
  ]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Seeds all localStorage data.
 * Re-runs automatically when SEED_VERSION changes (version bump forces fresh seed).
 */
export function seedData(): void {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

  if (storedVersion === SEED_VERSION) return   // already on latest seed

  // Clear everything before reseeding
  familyMemberService.clear()
  incomeService.clear()
  expenseService.clear()
  emiService.clear()
  budgetService.clear()
  savingsGoalService.clear()

  // Insert members and collect their real IDs
  const insertedMembers = MEMBERS.map((m) =>
    familyMemberService.create(m as Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>),
  )
  const memberIds = insertedMembers.map((m) => m.id)

  buildIncomes(memberIds).forEach((i) => incomeService.create(i))
  buildExpenses(memberIds).forEach((e) => expenseService.create(e))
  buildEMIs(memberIds).forEach((e) => emiService.create(e))
  buildBudgets().forEach((b) => budgetService.create(b))
  buildGoals(memberIds).forEach((g) => savingsGoalService.create(g))

  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
}

/** Clears all app data from localStorage (Settings → Danger Zone). */
export function clearAllData(): void {
  familyMemberService.clear()
  incomeService.clear()
  expenseService.clear()
  emiService.clear()
  budgetService.clear()
  savingsGoalService.clear()
  localStorage.removeItem('ffm_settings')
  localStorage.removeItem(SEED_VERSION_KEY)
}
