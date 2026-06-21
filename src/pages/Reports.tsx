import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { BarChart2, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  incomeService, expenseService, familyMemberService,
} from '@/services'
import { formatCurrency, getMonthKey } from '@/utils/formatters'
import {
  calculateMonthlyData, calculateCategoryBreakdown,
} from '@/utils/calculations'
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/constants'
import type { FamilyMember } from '@/types'

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
          <span style={{ color: entry.color }} className="font-medium">{entry.name}: </span>
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  const [monthRange, setMonthRange] = useState('6')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [monthlyData, setMonthlyData] = useState<ReturnType<typeof calculateMonthlyData>>([])
  const [categoryData, setCategoryData] = useState<ReturnType<typeof calculateCategoryBreakdown>>([])
  const [memberData, setMemberData] = useState<Array<{ name: string; income: number; expenses: number; color: string }>>([])
  const [currentMonth] = useState(getMonthKey())

  useEffect(() => {
    const allIncomes = incomeService.getAll()
    const allExpenses = expenseService.getAll()
    const allMembers = familyMemberService.getAll()
    setMembers(allMembers)

    const monthly = calculateMonthlyData(allIncomes, allExpenses)
    setMonthlyData(monthly.slice(-parseInt(monthRange)))

    const catData = calculateCategoryBreakdown(allExpenses, currentMonth)
    setCategoryData(catData)

    const mData = allMembers.map((m) => ({
      name: m.name.split(' ')[0],
      income: allIncomes.filter((i) => i.memberId === m.id).reduce((s, i) => s + i.amount, 0),
      expenses: allExpenses.filter((e) => e.memberId === m.id).reduce((s, e) => s + e.amount, 0),
      color: m.color,
    }))
    setMemberData(mData)
  }, [monthRange, currentMonth])

  const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0)
  const totalExpenses = monthlyData.reduce((s, d) => s + d.expenses, 0)
  const totalSavings = monthlyData.reduce((s, d) => s + d.savings, 0)
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0

  const topCategory = categoryData[0]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Detailed financial reports and insights."
      >
        <Select value={monthRange} onValueChange={setMonthRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 Months</SelectItem>
            <SelectItem value="6">Last 6 Months</SelectItem>
            <SelectItem value="12">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-500/10"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(totalSavings)}
          icon={<PiggyBank className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Savings Rate"
          value={`${savingsRate}%`}
          icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
        />
      </div>

      {monthlyData.length === 0 ? (
        <EmptyState
          icon={<BarChart2 className="h-8 w-8" />}
          title="No data to display"
          description="Add income and expense records to generate reports."
        />
      ) : (
        <>
          {/* Monthly Overview — Area Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Monthly Cash Flow</CardTitle>
              <p className="text-xs text-muted-foreground">Income, Expenses & Savings trend</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#3B82F6" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" />
                  <Area type="monotone" dataKey="savings" name="Savings" stroke="#22C55E" strokeWidth={2} fill="url(#savingsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown — Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Expense by Category</CardTitle>
                <p className="text-xs text-muted-foreground">Current month breakdown</p>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <EmptyState
                    icon={<BarChart2 className="h-6 w-6" />}
                    title="No expenses this month"
                    description="Add expenses to see category breakdown."
                    compact
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                        labelLine={false}
                        label={renderCustomizedLabel}
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
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Member Comparison — Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Member Comparison</CardTitle>
                <p className="text-xs text-muted-foreground">Total income vs expenses per member</p>
              </CardHeader>
              <CardContent>
                {memberData.length === 0 ? (
                  <EmptyState
                    icon={<BarChart2 className="h-6 w-6" />}
                    title="No members"
                    description="Add family members to see comparison."
                    compact
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={memberData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis
                        tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="income" name="Income" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Savings Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Monthly Savings</CardTitle>
              <p className="text-xs text-muted-foreground">Net savings per month</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="savings"
                    name="Savings"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? '#22C55E' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category table */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Category Details</CardTitle>
                <p className="text-xs text-muted-foreground">Expense breakdown — current month</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {categoryData.map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: cat.color }}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{cat.category}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{cat.percentage}%</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
