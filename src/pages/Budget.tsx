import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus, PieChart, AlertTriangle, CheckCircle2,
  Utensils, Car, ShoppingBag, Tv, HeartPulse, GraduationCap,
  Zap, Home, Shield, TrendingUp, Smile, Plane, Gift, MoreHorizontal,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { budgetService, expenseService } from '@/services'
import { formatCurrency, getMonthKey } from '@/utils/formatters'
import { calculateBudgetUsed } from '@/utils/calculations'
import { useToast } from '@/hooks/useToast'
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants'
import type { Budget, ExpenseCategory } from '@/types'

const BUDGET_ICON_MAP: Record<string, React.ElementType> = {
  Utensils, Car, ShoppingBag, Tv, HeartPulse, GraduationCap,
  Zap, Home, Shield, TrendingUp, Smile, Plane, Gift, MoreHorizontal,
}

function getCategoryIcon(category: string): React.ElementType {
  const name = CATEGORY_ICONS[category as ExpenseCategory] ?? 'MoreHorizontal'
  return BUDGET_ICON_MAP[name] ?? MoreHorizontal
}

interface BudgetFormData {
  category: ExpenseCategory
  monthlyLimit: string
}

const INITIAL_FORM: BudgetFormData = {
  category: 'Food & Dining',
  monthlyLimit: '',
}

export default function Budget() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [allExpenses, setAllExpenses] = useState<ReturnType<typeof expenseService.getAll>>([])
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState<BudgetFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setBudgets(budgetService.getByMonth(selectedMonth))
    setAllExpenses(expenseService.getAll())
  }, [selectedMonth])

  useEffect(() => { loadData() }, [loadData])

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return getMonthKey(d)
  })

  const budgetItems = budgets.map((b) => {
    const used = calculateBudgetUsed(allExpenses, b.category, selectedMonth)
    const pct = b.monthlyLimit > 0 ? Math.min(100, Math.round((used / b.monthlyLimit) * 100)) : 0
    return { ...b, used, pct, remaining: b.monthlyLimit - used }
  })

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0)
  const totalUsed = budgetItems.reduce((s, b) => s + b.used, 0)
  const overBudget = budgetItems.filter((b) => b.pct >= 100).length

  const usedCategories = new Set(budgets.map((b) => b.category))
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !usedCategories.has(c.value))

  function openAdd() {
    setEditingBudget(null)
    setFormData({
      category: availableCategories[0]?.value ?? 'Other',
      monthlyLimit: '',
    })
    setIsDialogOpen(true)
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      monthlyLimit: String(budget.monthlyLimit),
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingBudget(null)
    setFormData(INITIAL_FORM)
  }

  async function handleSave() {
    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      toast('Please enter a valid budget amount.', 'error')
      return
    }
    setSaving(true)
    try {
      budgetService.upsert(
        editingBudget?.category ?? formData.category,
        selectedMonth,
        parseFloat(formData.monthlyLimit),
      )
      toast(editingBudget ? 'Budget updated.' : 'Budget set.', 'success')
      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(budget: Budget) {
    budgetService.delete(budget.id)
    toast('Budget removed.', 'success')
    loadData()
  }

  function getProgressColor(pct: number): string {
    if (pct >= 100) return 'bg-destructive'
    if (pct >= 80) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description="Set and monitor monthly spending limits by category."
      >
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="gap-2" disabled={availableCategories.length === 0}>
          <Plus className="h-4 w-4" />
          Set Budget
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Budget"
          value={formatCurrency(totalBudget)}
          icon={<PieChart className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalUsed)}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
        />
        <StatCard
          label="Over Budget"
          value={String(overBudget)}
          icon={<CheckCircle2 className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-500/10"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {budgetItems.length === 0 ? (
        <EmptyState
          icon={<PieChart className="h-8 w-8" />}
          title="No budgets set"
          description="Set a monthly budget for each spending category."
          action={openAdd}
          actionLabel="Set Budget"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgetItems.map((item) => {
            const IconComp = getCategoryIcon(item.category)
            const color = CATEGORY_COLORS[item.category as ExpenseCategory] ?? '#C9CBCF'
            const isOver = item.pct >= 100
            const isWarning = item.pct >= 80 && !isOver

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isOver ? 'ring-1 ring-destructive/40' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <IconComp className="h-5 w-5" style={{ color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.category}</p>
                          <p className="text-xs text-muted-foreground">{selectedMonth}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isOver && (
                          <span className="text-xs font-semibold text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                            Over!
                          </span>
                        )}
                        {isWarning && (
                          <span className="text-xs font-semibold text-warning bg-warning/10 rounded-full px-2 py-0.5">
                            Near limit
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Spent: <span className="font-semibold text-foreground">{formatCurrency(item.used)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Budget: <span className="font-semibold text-foreground">{formatCurrency(item.monthlyLimit)}</span>
                        </span>
                      </div>

                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getProgressColor(item.pct)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className={isOver ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {item.pct}% used
                        </span>
                        <span className={item.remaining < 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {item.remaining >= 0
                            ? `${formatCurrency(item.remaining)} left`
                            : `${formatCurrency(Math.abs(item.remaining))} over`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive hover:border-destructive/60"
                        onClick={() => handleDelete(item)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Overall summary */}
      {budgetItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-semibold">{formatCurrency(totalUsed)} / {formatCurrency(totalBudget)}</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${totalUsed > totalBudget ? 'bg-destructive' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {formatCurrency(Math.max(0, totalBudget - totalUsed))} remaining
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editingBudget && (
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v as ExpenseCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingBudget && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{editingBudget.category}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="budget-limit">Monthly Limit (₹)</Label>
              <Input
                id="budget-limit"
                type="number"
                min="0"
                placeholder="15000"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData((p) => ({ ...p, monthlyLimit: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.monthlyLimit}>
              {saving ? 'Saving…' : editingBudget ? 'Save Changes' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
