export type Theme = 'light' | 'dark' | 'system'

export type MemberRole = 'Parent' | 'Child' | 'Spouse' | 'Guardian' | 'Other'

export interface FamilyMember {
  id: string
  name: string
  avatar: string // emoji or initials
  role: MemberRole
  email: string
  phone: string
  monthlyIncome: number
  color: string // hex color for avatar bg
  createdAt: string
  updatedAt: string
}

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Rental'
  | 'Bonus'
  | 'Gift'
  | 'Other'

export interface Income {
  id: string
  memberId: string
  category: IncomeCategory
  amount: number
  description: string
  date: string
  isRecurring: boolean
  recurringDay?: number
  createdAt: string
  updatedAt: string
}

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Utilities'
  | 'Housing'
  | 'Insurance'
  | 'Investment'
  | 'Personal Care'
  | 'Travel'
  | 'Gifts'
  | 'Other'

export interface Expense {
  id: string
  memberId: string
  category: ExpenseCategory
  amount: number
  description: string
  date: string
  notes: string
  isRecurring: boolean
  recurringDay?: number
  createdAt: string
  updatedAt: string
}

export type EMIStatus = 'Active' | 'Completed' | 'Paused'

export interface EMI {
  id: string
  memberId: string
  loanName: string
  lender: string
  totalAmount: number
  emiAmount: number
  totalMonths: number
  remainingMonths: number
  dueDate: number // day of month
  startDate: string
  interestRate: number
  status: EMIStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  category: ExpenseCategory
  monthlyLimit: number
  month: string // 'YYYY-MM'
  createdAt: string
  updatedAt: string
}

export type GoalStatus = 'Active' | 'Completed' | 'Paused'

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  icon: string
  color: string
  status: GoalStatus
  description: string
  memberId?: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: Theme
  currency: string
  currencySymbol: string
  dateFormat: string
  familyName: string
  language: string
  notifications: boolean
  monthlyBudgetAlert: boolean
  budgetAlertThreshold: number
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  totalSavings: number
  upcomingEMIs: EMI[]
  recentTransactions: Transaction[]
  monthlyData: MonthlyData[]
  categoryData: CategoryData[]
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  memberId: string
  category: string
  amount: number
  description: string
  date: string
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}
