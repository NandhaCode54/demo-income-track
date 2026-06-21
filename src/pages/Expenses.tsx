import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, TrendingDown, Filter, RefreshCw,
  Utensils, Car, ShoppingBag, Tv, HeartPulse, GraduationCap,
  Zap, Home, Shield, TrendingUp, Smile, Plane, Gift, MoreHorizontal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatCard } from '@/components/shared/StatCard'
import { expenseService, familyMemberService } from '@/services'
import { formatCurrency, formatDate, getMonthKey } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import { EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants'
import type { Expense, ExpenseCategory, FamilyMember } from '@/types'

const EXPENSE_ICON_MAP: Record<string, React.ElementType> = {
  Utensils, Car, ShoppingBag, Tv, HeartPulse, GraduationCap,
  Zap, Home, Shield, TrendingUp, Smile, Plane, Gift, MoreHorizontal,
}

function getCategoryIcon(category: string): React.ElementType {
  const name = CATEGORY_ICONS[category as ExpenseCategory] ?? 'MoreHorizontal'
  return EXPENSE_ICON_MAP[name] ?? MoreHorizontal
}

interface ExpenseFormData {
  memberId: string
  category: ExpenseCategory
  amount: string
  description: string
  date: string
  notes: string
  isRecurring: boolean
  recurringDay: string
}

const INITIAL_FORM: ExpenseFormData = {
  memberId: '',
  category: 'Food & Dining',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  isRecurring: false,
  recurringDay: '1',
}

export default function Expenses() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMember, setFilterMember] = useState('all')
  const [filterMonth, setFilterMonth] = useState(getMonthKey())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setMembers(familyMemberService.getAll())
    setExpenses(expenseService.getAll())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const memberMap = React.useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const filtered = React.useMemo(() => {
    let list = expenses
    if (filterMonth !== 'all') list = list.filter((e) => e.date.startsWith(filterMonth))
    if (filterCategory !== 'all') list = list.filter((e) => e.category === filterCategory)
    if (filterMember !== 'all') list = list.filter((e) => e.memberId === filterMember)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filterMonth, filterCategory, filterMember, searchQuery])

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)
  const currentMonthTotal = expenseService.getTotalByMonth(getMonthKey())

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return getMonthKey(d)
  })

  function openAdd() {
    setEditingExpense(null)
    setFormData({ ...INITIAL_FORM, memberId: members[0]?.id ?? '' })
    setIsDialogOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    setFormData({
      memberId: expense.memberId,
      category: expense.category,
      amount: String(expense.amount),
      description: expense.description,
      date: expense.date,
      notes: expense.notes,
      isRecurring: expense.isRecurring,
      recurringDay: String(expense.recurringDay ?? 1),
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingExpense(null)
    setFormData(INITIAL_FORM)
  }

  async function handleSave() {
    if (!formData.amount || !formData.description.trim() || !formData.memberId) {
      toast('Please fill all required fields.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        memberId: formData.memberId,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        notes: formData.notes.trim(),
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
      }
      if (editingExpense) {
        expenseService.update(editingExpense.id, payload)
        toast('Expense updated.', 'success')
      } else {
        expenseService.create(payload)
        toast('Expense added.', 'success')
      }
      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    expenseService.delete(deleteTarget.id)
    toast('Expense deleted.', 'success')
    setDeleteTarget(null)
    loadData()
  }

  function updateField<K extends keyof ExpenseFormData>(key: K, val: ExpenseFormData[K]) {
    setFormData((p) => ({ ...p, [key]: val }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track all expenses across your family."
        action={openAdd}
        actionLabel="Add Expense"
        actionIcon={<Plus className="h-4 w-4" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="This Month"
          value={formatCurrency(currentMonthTotal)}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-500/10"
        />
        <StatCard
          label="Filtered Total"
          value={formatCurrency(totalFiltered)}
          icon={<Filter className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
        />
        <StatCard
          label="Recurring"
          value={String(expenses.filter((e) => e.isRecurring).length)}
          icon={<RefreshCw className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search expenses…"
          className="w-full sm:w-60"
        />
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMember} onValueChange={setFilterMember}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<TrendingDown className="h-8 w-8" />}
          title="No expenses found"
          description="Add your first expense or adjust filters."
          action={openAdd}
          actionLabel="Add Expense"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {filtered.map((expense) => {
                  const IconComp = getCategoryIcon(expense.category)
                  const color = CATEGORY_COLORS[expense.category as ExpenseCategory] ?? '#C9CBCF'
                  const member = memberMap.get(expense.memberId)
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <IconComp className="h-5 w-5" style={{ color }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {expense.description}
                          </p>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {expense.category}
                          </Badge>
                          {expense.isRecurring && (
                            <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                              <RefreshCw className="h-2.5 w-2.5" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(expense.date)}
                          {member && ` · ${member.name}`}
                          {expense.notes && ` · ${expense.notes}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {member && <MemberAvatar member={member} size="sm" showTooltip />}
                        <span className="text-sm font-bold text-red-500 min-w-[80px] text-right">
                          -{formatCurrency(expense.amount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(expense)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(expense)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20">
              <span className="text-sm text-muted-foreground">{filtered.length} entries</span>
              <span className="text-sm font-bold text-red-500">
                Total: {formatCurrency(totalFiltered)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Paid By *</Label>
              <Select value={formData.memberId} onValueChange={(v) => updateField('memberId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => updateField('category', v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount (₹) *</Label>
              <Input
                id="exp-amount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-desc">Description *</Label>
              <Input
                id="exp-desc"
                placeholder="e.g. Monthly groceries"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-notes">Notes</Label>
              <Textarea
                id="exp-notes"
                placeholder="Optional notes…"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Recurring</p>
                <p className="text-xs text-muted-foreground">Repeats every month</p>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(v) => updateField('isRecurring', v)}
              />
            </div>

            {formData.isRecurring && (
              <div className="space-y-1.5">
                <Label htmlFor="exp-day">Day of Month</Label>
                <Input
                  id="exp-day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurringDay}
                  onChange={(e) => updateField('recurringDay', e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.amount || !formData.description.trim()}
            >
              {saving ? 'Saving…' : editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Expense"
        message={`Delete "${deleteTarget?.description}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
