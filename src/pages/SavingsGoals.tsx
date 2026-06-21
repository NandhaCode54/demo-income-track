import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Target, PiggyBank, CheckCircle2, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ColorPicker } from '@/components/shared/ColorPicker'
import { savingsGoalService, familyMemberService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { calculateGoalProgress } from '@/utils/calculations'
import { useToast } from '@/hooks/useToast'
import { COLORS } from '@/constants'
import type { SavingsGoal, GoalStatus, FamilyMember } from '@/types'

const GOAL_ICONS = ['🎯', '✈️', '🏠', '🎓', '🚗', '💍', '🏖️', '🛡️', '💰', '🌍', '🎁', '💻']

const STATUS_BADGE: Record<GoalStatus, string> = {
  Active: 'bg-green-500/10 text-green-500 border-green-500/20',
  Completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
}

interface GoalFormData {
  name: string
  targetAmount: string
  currentAmount: string
  targetDate: string
  icon: string
  color: string
  status: GoalStatus
  description: string
  memberId: string
}

const INITIAL_FORM: GoalFormData = {
  name: '',
  targetAmount: '',
  currentAmount: '0',
  targetDate: '',
  icon: '🎯',
  color: COLORS[0],
  status: 'Active',
  description: '',
  memberId: '',
}

interface ContributeFormData {
  amount: string
}

export default function SavingsGoals() {
  const { toast } = useToast()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | GoalStatus>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null)
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>(INITIAL_FORM)
  const [contributeAmount, setContributeAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setGoals(savingsGoalService.getAll())
    setMembers(familyMemberService.getAll())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = filterStatus === 'all' ? goals : goals.filter((g) => g.status === filterStatus)
  const totalSaved = savingsGoalService.getTotalSaved()
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const completedCount = goals.filter((g) => g.status === 'Completed').length

  function openAdd() {
    setEditingGoal(null)
    setFormData(INITIAL_FORM)
    setIsDialogOpen(true)
  }

  function openEdit(goal: SavingsGoal) {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate,
      icon: goal.icon,
      color: goal.color,
      status: goal.status,
      description: goal.description,
      memberId: goal.memberId ?? '',
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingGoal(null)
    setFormData(INITIAL_FORM)
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.targetAmount) {
      toast('Please fill all required fields.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: formData.targetDate,
        icon: formData.icon,
        color: formData.color,
        status: formData.status,
        description: formData.description.trim(),
        memberId: formData.memberId || undefined,
      }
      if (editingGoal) {
        savingsGoalService.update(editingGoal.id, payload)
        toast('Goal updated.', 'success')
      } else {
        savingsGoalService.create(payload)
        toast('Goal created.', 'success')
      }
      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    savingsGoalService.delete(deleteTarget.id)
    toast('Goal deleted.', 'success')
    setDeleteTarget(null)
    loadData()
  }

  async function handleContribute() {
    if (!contributeTarget || !contributeAmount) return
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) {
      toast('Enter a valid amount.', 'error')
      return
    }
    savingsGoalService.addContribution(contributeTarget.id, amount)
    toast(`${formatCurrency(amount)} added to "${contributeTarget.name}".`, 'success')
    setContributeTarget(null)
    setContributeAmount('')
    loadData()
  }

  function updateField<K extends keyof GoalFormData>(key: K, val: GoalFormData[K]) {
    setFormData((p) => ({ ...p, [key]: val }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals"
        description="Create and track your family's savings targets."
        action={openAdd}
        actionLabel="New Goal"
        actionIcon={<Plus className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Saved"
          value={formatCurrency(totalSaved)}
          icon={<PiggyBank className="h-5 w-5 text-green-500" />}
          iconBg="bg-green-500/10"
        />
        <StatCard
          label="Total Target"
          value={formatCurrency(totalTarget)}
          icon={<Target className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Completed"
          value={String(completedCount)}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="flex gap-2">
        {(['all', 'Active', 'Paused', 'Completed'] as const).map((s) => (
          <Button
            key={s}
            variant={filterStatus === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'All' : s}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="No savings goals"
          description="Create a savings goal to start tracking your progress."
          action={openAdd}
          actionLabel="New Goal"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((goal) => {
            const progress = calculateGoalProgress(goal)
            const daysLeft = goal.targetDate
              ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
              : null

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {goal.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {goal.name}
                          </p>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0 ${STATUS_BADGE[goal.status]}`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-lg sm:text-2xl font-bold text-foreground">
                          {formatCurrency(goal.currentAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold" style={{ color: goal.color }}>
                        {progress}%
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden mb-3">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: goal.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Meta */}
                    {goal.targetDate && (
                      <p className="text-xs text-muted-foreground mb-4">
                        Target: {formatDate(goal.targetDate)}
                        {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft} days left`}
                        {daysLeft !== null && daysLeft <= 0 && (
                          <span className="text-destructive"> · Overdue</span>
                        )}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {goal.status === 'Active' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => {
                            setContributeTarget(goal)
                            setContributeAmount('')
                          }}
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Contribute
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openEdit(goal)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive hover:border-destructive/60"
                        onClick={() => setDeleteTarget(goal)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => updateField('icon', icon)}
                    className={`h-9 w-9 rounded-lg text-xl flex items-center justify-center transition-colors ${
                      formData.icon === icon
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-name">Goal Name *</Label>
              <Input
                id="goal-name"
                placeholder="e.g. Family Vacation"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-desc">Description</Label>
              <Textarea
                id="goal-desc"
                placeholder="Describe your goal…"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-target">Target Amount (₹) *</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="0"
                  placeholder="300000"
                  value={formData.targetAmount}
                  onChange={(e) => updateField('targetAmount', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-current">Current Amount (₹)</Label>
                <Input
                  id="goal-current"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.currentAmount}
                  onChange={(e) => updateField('currentAmount', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-date">Target Date</Label>
              <Input
                id="goal-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => updateField('targetDate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField('status', v as GoalStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorPicker value={formData.color} onChange={(c) => updateField('color', c)} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim() || !formData.targetAmount}
            >
              {saving ? 'Saving…' : editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={!!contributeTarget} onOpenChange={(o) => !o && setContributeTarget(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          {contributeTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {contributeTarget.icon} {contributeTarget.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(contributeTarget.currentAmount)} / {formatCurrency(contributeTarget.targetAmount)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contrib-amount">Amount (₹)</Label>
                <Input
                  id="contrib-amount"
                  type="number"
                  min="0"
                  placeholder="10000"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setContributeTarget(null)}>Cancel</Button>
            <Button onClick={handleContribute} disabled={!contributeAmount}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Goal"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
