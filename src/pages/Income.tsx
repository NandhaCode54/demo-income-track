import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, Filter, RefreshCw } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatCard } from '@/components/shared/StatCard'
import { incomeService, familyMemberService } from '@/services'
import { formatCurrency, formatDate, getMonthKey } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import { INCOME_CATEGORIES } from '@/constants'
import type { Income, IncomeCategory, FamilyMember } from '@/types'
import {
  Briefcase, Laptop, Store, TrendingUp as TrendingUpIcon, Building2, Star, Gift, MoreHorizontal,
} from 'lucide-react'

const INCOME_ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Laptop, Store, TrendingUp: TrendingUpIcon, Building2, Star, Gift, MoreHorizontal,
}

function getIncomeIcon(category: string): React.ElementType {
  const cat = INCOME_CATEGORIES.find((c) => c.value === category)
  return INCOME_ICON_MAP[cat?.icon ?? 'MoreHorizontal'] ?? MoreHorizontal
}

const INCOME_CATEGORY_COLORS: Record<IncomeCategory, string> = {
  Salary: '#3B82F6',
  Freelance: '#8B5CF6',
  Business: '#F97316',
  Investment: '#22C55E',
  Rental: '#14B8A6',
  Bonus: '#EAB308',
  Gift: '#EC4899',
  Other: '#6B7280',
}

interface IncomeFormData {
  memberId: string
  category: IncomeCategory
  amount: string
  description: string
  date: string
  isRecurring: boolean
  recurringDay: string
}

const INITIAL_FORM: IncomeFormData = {
  memberId: '',
  category: 'Salary',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  isRecurring: false,
  recurringDay: '1',
}

export default function Income() {
  const { toast } = useToast()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMember, setFilterMember] = useState('all')
  const [filterMonth, setFilterMonth] = useState(getMonthKey())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null)
  const [formData, setFormData] = useState<IncomeFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    const allMembers = familyMemberService.getAll()
    setMembers(allMembers)
    setIncomes(incomeService.getAll())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const memberMap = React.useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const filtered = React.useMemo(() => {
    let list = incomes
    if (filterMonth) list = list.filter((i) => i.date.startsWith(filterMonth))
    if (filterCategory !== 'all') list = list.filter((i) => i.category === filterCategory)
    if (filterMember !== 'all') list = list.filter((i) => i.memberId === filterMember)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((i) =>
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [incomes, filterMonth, filterCategory, filterMember, searchQuery])

  const totalFiltered = filtered.reduce((s, i) => s + i.amount, 0)
  const currentMonthTotal = incomeService.getTotalByMonth(getMonthKey())

  function openAdd() {
    setEditingIncome(null)
    setFormData({ ...INITIAL_FORM, memberId: members[0]?.id ?? '' })
    setIsDialogOpen(true)
  }

  function openEdit(income: Income) {
    setEditingIncome(income)
    setFormData({
      memberId: income.memberId,
      category: income.category,
      amount: String(income.amount),
      description: income.description,
      date: income.date,
      isRecurring: income.isRecurring,
      recurringDay: String(income.recurringDay ?? 1),
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingIncome(null)
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
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
      }
      if (editingIncome) {
        incomeService.update(editingIncome.id, payload)
        toast('Income entry updated.', 'success')
      } else {
        incomeService.create(payload)
        toast('Income entry added.', 'success')
      }
      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    incomeService.delete(deleteTarget.id)
    toast('Income entry deleted.', 'success')
    setDeleteTarget(null)
    loadData()
  }

  function updateField<K extends keyof IncomeFormData>(key: K, val: IncomeFormData[K]) {
    setFormData((p) => ({ ...p, [key]: val }))
  }

  // Generate last 12 month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return getMonthKey(d)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description="Track all income sources across your family."
        action={openAdd}
        actionLabel="Add Income"
        actionIcon={<Plus className="h-4 w-4" />}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="This Month"
          value={formatCurrency(currentMonthTotal)}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="Filtered Total"
          value={formatCurrency(totalFiltered)}
          icon={<Filter className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Recurring Incomes"
          value={String(incomes.filter((i) => i.isRecurring).length)}
          icon={<RefreshCw className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search income…"
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
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INCOME_CATEGORIES.map((c) => (
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

      {/* Income List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="No income entries found"
          description="Add your first income entry or adjust your filters."
          action={openAdd}
          actionLabel="Add Income"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {filtered.map((income) => {
                  const IconComp = getIncomeIcon(income.category)
                  const color = INCOME_CATEGORY_COLORS[income.category] ?? '#6B7280'
                  const member = memberMap.get(income.memberId)
                  return (
                    <motion.div
                      key={income.id}
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
                            {income.description}
                          </p>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {income.category}
                          </Badge>
                          {income.isRecurring && (
                            <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                              <RefreshCw className="h-2.5 w-2.5" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(income.date)}
                          {member && ` · ${member.name}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {member && <MemberAvatar member={member} size="sm" showTooltip />}
                        <span className="text-sm font-bold text-green-500 min-w-[80px] text-right">
                          +{formatCurrency(income.amount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(income)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(income)}
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
              <span className="text-sm font-bold text-green-500">
                Total: {formatCurrency(totalFiltered)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIncome ? 'Edit Income' : 'Add Income'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Family Member *</Label>
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
              <Select value={formData.category} onValueChange={(v) => updateField('category', v as IncomeCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-amount">Amount (₹) *</Label>
              <Input
                id="inc-amount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-desc">Description *</Label>
              <Input
                id="inc-desc"
                placeholder="e.g. Monthly salary – Company"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-date">Date</Label>
              <Input
                id="inc-date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
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
                <Label htmlFor="inc-day">Day of Month</Label>
                <Input
                  id="inc-day"
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
            <Button onClick={handleSave} disabled={saving || !formData.amount || !formData.description.trim()}>
              {saving ? 'Saving…' : editingIncome ? 'Save Changes' : 'Add Income'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Income"
        message={`Delete "${deleteTarget?.description}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
