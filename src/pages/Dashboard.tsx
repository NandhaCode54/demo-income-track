import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { subMonths } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  AlertCircle, Utensils, Car, ShoppingBag, Tv, HeartPulse,
  GraduationCap, Zap, Home, Shield, Smile, Plane, Gift,
  MoreHorizontal, Briefcase, Laptop, Store, Building2, Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/StatCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { SkeletonCard } from '@/components/shared/LoadingSpinner'
import {
  familyMemberService,
  incomeService,
  expenseService,
  emiService,
  savingsGoalService,
} from '@/services'
import {
  calculateMonthlyData,
  calculateCategoryBreakdown,
  getDaysUntilDue,
} from '@/utils/calculations'
import { formatCurrency, formatDate, getMonthKey } from '@/utils/formatters'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants'
import type { FamilyMember, Transaction, MonthlyData, CategoryData, EMI } from '@/types'

// ---------------------------------------------------------------------------
// Icon map — maps lucide icon name strings to components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  Utensils, Car, ShoppingBag, Tv, HeartPulse, GraduationCap,
  Zap, Home, Shield, TrendingUp, Smile, Plane, Gift, MoreHorizontal,
  Briefcase, Laptop, Store, Building2, Star,
}

function getCategoryIcon(category: string): React.ElementType {
  const expCat = EXPENSE_CATEGORIES.find((c) => c.value === category)
  const incCat = INCOME_CATEGORIES.find((c) => c.value === category)
  const iconName = expCat?.icon ?? incCat?.icon ?? 'MoreHorizontal'
  return ICON_MAP[iconName] ?? MoreHorizontal
}

function getCategoryColor(category: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.color ?? '#C9CBCF'
}

// ---------------------------------------------------------------------------
// Greeting helper
// ---------------------------------------------------------------------------
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ---------------------------------------------------------------------------
// Framer-motion variants for staggered stat cards
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

// ---------------------------------------------------------------------------
// EMI urgency badge variant
// ---------------------------------------------------------------------------
function emiBadgeVariant(daysLeft: number): 'destructive' | 'warning' | 'success' {
  if (daysLeft <= 3) return 'destructive'
  if (daysLeft <= 7) return 'warning'
  return 'success'
}

// ---------------------------------------------------------------------------
// Custom tooltip for Recharts
// ---------------------------------------------------------------------------
interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}:{' '}
          </span>
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard state shape
// ---------------------------------------------------------------------------
interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  totalSavings: number
  incomeTrend: 'up' | 'down' | 'neutral'
  incomeTrendValue: string
  expenseTrend: 'up' | 'down' | 'neutral'
  expenseTrendValue: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
    totalSavings: 0,
    incomeTrend: 'neutral',
    incomeTrendValue: '0%',
    expenseTrend: 'neutral',
    expenseTrendValue: '0%',
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [upcomingEMIs, setUpcomingEMIs] = useState<EMI[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    const now = new Date()
    const currentMonth = getMonthKey(now)
    const lastMonth = getMonthKey(subMonths(now, 1))

    // Raw data
    const allIncomes = incomeService.getAll()
    const allExpenses = expenseService.getAll()
    const allEMIs = emiService.getAll()
    const allMembers = familyMemberService.getAll()

    // ---- Stats ----
    const totalIncome = incomeService.getTotalByMonth(currentMonth)
    const totalExpenses = expenseService.getTotalByMonth(currentMonth)
    const lastMonthIncome = incomeService.getTotalByMonth(lastMonth)
    const lastMonthExpenses = expenseService.getTotalByMonth(lastMonth)
    const totalSavings = savingsGoalService.getTotalSaved()

    const incomeChange =
      lastMonthIncome > 0
        ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100
        : 0
    const expenseChange =
      lastMonthExpenses > 0
        ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0

    setStats({
      totalIncome,
      totalExpenses,
      remainingBalance: totalIncome - totalExpenses,
      totalSavings,
      incomeTrend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'neutral',
      incomeTrendValue: `${Math.abs(incomeChange).toFixed(1)}%`,
      expenseTrend: expenseChange > 0 ? 'up' : expenseChange < 0 ? 'down' : 'neutral',
      expenseTrendValue: `${Math.abs(expenseChange).toFixed(1)}%`,
    })

    // ---- Monthly chart (last 6 months) ----
    const monthly = calculateMonthlyData(allIncomes, allExpenses)
    setMonthlyData(monthly.slice(-6))

    // ---- Category breakdown (current month) ----
    setCategoryData(calculateCategoryBreakdown(allExpenses, currentMonth))

    // ---- Upcoming EMIs ----
    setUpcomingEMIs(emiService.getUpcoming(30))

    // ---- Recent transactions ----
    const incomeT: Transaction[] = allIncomes.map((i) => ({
      id: i.id,
      type: 'income',
      memberId: i.memberId,
      category: i.category,
      amount: i.amount,
      description: i.description,
      date: i.date,
    }))
    const expenseT: Transaction[] = allExpenses.map((e) => ({
      id: e.id,
      type: 'expense',
      memberId: e.memberId,
      category: e.category,
      amount: e.amount,
      description: e.description,
      date: e.date,
    }))
    const combined = [...incomeT, ...expenseT]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
    setRecentTransactions(combined)

    setMembers(allMembers)
    setLoading(false)
  }, [])

  const memberMap = React.useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  )

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </div>
    )
  }

  const balanceIsNegative = stats.remainingBalance < 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title={`${getGreeting()} 👋`}
        description="Here's your family's financial overview for this month."
      />

      {/* ── Stat cards ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <StatCard
            label="Total Income"
            value={formatCurrency(stats.totalIncome)}
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            iconBg="bg-green-500/10"
            trend={stats.incomeTrend}
            trendValue={stats.incomeTrendValue}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Total Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={<TrendingDown className="h-5 w-5 text-red-500" />}
            iconBg="bg-red-500/10"
            trend={stats.expenseTrend}
            trendValue={stats.expenseTrendValue}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Remaining Balance"
            value={formatCurrency(Math.abs(stats.remainingBalance))}
            icon={<Wallet className="h-5 w-5 text-blue-500" />}
            iconBg="bg-blue-500/10"
            trend={balanceIsNegative ? 'down' : 'neutral'}
            trendValue={balanceIsNegative ? 'Deficit' : undefined}
          />
        </motion.div>

        <motion.div variants={cardVariants}>
          <StatCard
            label="Total Savings"
            value={formatCurrency(stats.totalSavings)}
            icon={<PiggyBank className="h-5 w-5 text-purple-500" />}
            iconBg="bg-purple-500/10"
          />
        </motion.div>
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly overview bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Income vs Expenses — last 6 months</p>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="No data yet"
                description="Add income and expense records to see your monthly overview."
              />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyData}
                  barCategoryGap="20%"
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(128,128,128,0.15)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                    }
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense category pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">By category — this month</p>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-8 w-8" />}
                title="No expenses yet"
                description="Add expense records to see your category breakdown."
              />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming EMIs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming EMIs</CardTitle>
            <p className="text-xs text-muted-foreground">Active EMIs due within 30 days</p>
          </CardHeader>
          <CardContent>
            {upcomingEMIs.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className="h-8 w-8" />}
                title="No upcoming EMIs"
                description="No active EMIs are due in the next 30 days."
              />
            ) : (
              <div className="space-y-3">
                {upcomingEMIs.map((emi) => {
                  const daysLeft = getDaysUntilDue(emi.dueDate)
                  const badgeVariant = emiBadgeVariant(daysLeft)
                  return (
                    <div
                      key={emi.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {emi.loanName}
                        </p>
                        <p className="text-xs text-muted-foreground">{emi.lender}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(emi.emiAmount)}
                        </span>
                        <Badge variant={badgeVariant} className="whitespace-nowrap text-xs">
                          {daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <p className="text-xs text-muted-foreground">Last 8 income & expense entries</p>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-8 w-8" />}
                title="No transactions"
                description="Add income or expense records to see them here."
              />
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const IconComp = getCategoryIcon(tx.category)
                  const catColor = getCategoryColor(tx.category)
                  const member = memberMap.get(tx.memberId)
                  const isIncome = tx.type === 'income'

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                    >
                      {/* Category icon */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${catColor}20` }}
                      >
                        <IconComp
                          className="h-4 w-4"
                          style={{ color: catColor }}
                        />
                      </div>

                      {/* Description + date */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.date)} · {tx.category}
                        </p>
                      </div>

                      {/* Amount + member avatar */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            isIncome ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                        {member && (
                          <MemberAvatar member={member} size="sm" showTooltip />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
