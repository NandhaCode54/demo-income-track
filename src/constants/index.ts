import type { ExpenseCategory, IncomeCategory, MemberRole, Settings } from '@/types'

// ---------------------------------------------------------------------------
// Expense categories with metadata
// ---------------------------------------------------------------------------
export const EXPENSE_CATEGORIES: Array<{
  value: ExpenseCategory
  label: ExpenseCategory
  icon: string
  color: string
}> = [
  { value: 'Food & Dining', label: 'Food & Dining', icon: 'Utensils', color: '#FF6384' },
  { value: 'Transportation', label: 'Transportation', icon: 'Car', color: '#36A2EB' },
  { value: 'Shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#FFCE56' },
  { value: 'Entertainment', label: 'Entertainment', icon: 'Tv', color: '#4BC0C0' },
  { value: 'Healthcare', label: 'Healthcare', icon: 'HeartPulse', color: '#9966FF' },
  { value: 'Education', label: 'Education', icon: 'GraduationCap', color: '#FF9F40' },
  { value: 'Utilities', label: 'Utilities', icon: 'Zap', color: '#FF6384' },
  { value: 'Housing', label: 'Housing', icon: 'Home', color: '#C9CBCF' },
  { value: 'Insurance', label: 'Insurance', icon: 'Shield', color: '#4BC0C0' },
  { value: 'Investment', label: 'Investment', icon: 'TrendingUp', color: '#36A2EB' },
  { value: 'Personal Care', label: 'Personal Care', icon: 'Smile', color: '#FF6384' },
  { value: 'Travel', label: 'Travel', icon: 'Plane', color: '#FFCE56' },
  { value: 'Gifts', label: 'Gifts', icon: 'Gift', color: '#9966FF' },
  { value: 'Other', label: 'Other', icon: 'MoreHorizontal', color: '#C9CBCF' },
]

// ---------------------------------------------------------------------------
// Income categories
// ---------------------------------------------------------------------------
export const INCOME_CATEGORIES: Array<{
  value: IncomeCategory
  label: IncomeCategory
  icon: string
}> = [
  { value: 'Salary', label: 'Salary', icon: 'Briefcase' },
  { value: 'Freelance', label: 'Freelance', icon: 'Laptop' },
  { value: 'Business', label: 'Business', icon: 'Store' },
  { value: 'Investment', label: 'Investment', icon: 'TrendingUp' },
  { value: 'Rental', label: 'Rental', icon: 'Building2' },
  { value: 'Bonus', label: 'Bonus', icon: 'Star' },
  { value: 'Gift', label: 'Gift', icon: 'Gift' },
  { value: 'Other', label: 'Other', icon: 'MoreHorizontal' },
]

// ---------------------------------------------------------------------------
// Member roles
// ---------------------------------------------------------------------------
export const MEMBER_ROLES: MemberRole[] = [
  'Parent',
  'Child',
  'Spouse',
  'Guardian',
  'Other',
]

// ---------------------------------------------------------------------------
// Currency options
// ---------------------------------------------------------------------------
export const CURRENCY_OPTIONS: Array<{ code: string; symbol: string; name: string }> = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

// ---------------------------------------------------------------------------
// Date format options
// ---------------------------------------------------------------------------
export const DATE_FORMAT_OPTIONS: string[] = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
]

// ---------------------------------------------------------------------------
// Month names
// ---------------------------------------------------------------------------
export const MONTH_NAMES: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// ---------------------------------------------------------------------------
// Avatar / goal colors
// ---------------------------------------------------------------------------
export const COLORS: string[] = [
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F43F5E', // rose
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#06B6D4', // cyan
]

// ---------------------------------------------------------------------------
// Category colors (matches spec exactly)
// ---------------------------------------------------------------------------
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food & Dining': '#FF6384',
  'Transportation': '#36A2EB',
  'Shopping': '#FFCE56',
  'Entertainment': '#4BC0C0',
  'Healthcare': '#9966FF',
  'Education': '#FF9F40',
  'Utilities': '#FF6384',
  'Housing': '#C9CBCF',
  'Insurance': '#4BC0C0',
  'Investment': '#36A2EB',
  'Personal Care': '#FF6384',
  'Travel': '#FFCE56',
  'Gifts': '#9966FF',
  'Other': '#C9CBCF',
}

// ---------------------------------------------------------------------------
// Category icons (lucide component names)
// ---------------------------------------------------------------------------
export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  'Food & Dining': 'Utensils',
  'Transportation': 'Car',
  'Shopping': 'ShoppingBag',
  'Entertainment': 'Tv',
  'Healthcare': 'HeartPulse',
  'Education': 'GraduationCap',
  'Utilities': 'Zap',
  'Housing': 'Home',
  'Insurance': 'Shield',
  'Investment': 'TrendingUp',
  'Personal Care': 'Smile',
  'Travel': 'Plane',
  'Gifts': 'Gift',
  'Other': 'MoreHorizontal',
}

// ---------------------------------------------------------------------------
// Default app settings
// ---------------------------------------------------------------------------
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  familyName: 'My Family',
  language: 'en',
  notifications: true,
  monthlyBudgetAlert: true,
  budgetAlertThreshold: 80,
}

// ---------------------------------------------------------------------------
// Navigation items (10 pages)
// ---------------------------------------------------------------------------
export const NAV_ITEMS: Array<{ path: string; label: string; icon: string }> = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/members', label: 'Family Members', icon: 'Users' },
  { path: '/income', label: 'Income', icon: 'TrendingUp' },
  { path: '/expenses', label: 'Expenses', icon: 'TrendingDown' },
  { path: '/emi', label: 'EMI Tracker', icon: 'CreditCard' },
  { path: '/budget', label: 'Budget', icon: 'PieChart' },
  { path: '/savings', label: 'Savings Goals', icon: 'Target' },
  { path: '/reports', label: 'Reports', icon: 'BarChart2' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
]
