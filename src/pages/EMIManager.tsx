import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Calendar, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { emiService, familyMemberService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/formatters'
import {
  calculateEMIPaid, calculateEMIRemaining, calculateEMIProgress, getDaysUntilDue,
} from '@/utils/calculations'
import { useToast } from '@/hooks/useToast'
import type { EMI, EMIStatus, FamilyMember } from '@/types'

const STATUS_BADGE: Record<EMIStatus, string> = {
  Active: 'bg-green-500/10 text-green-500 border-green-500/20',
  Completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
}

interface EMIFormData {
  memberId: string
  loanName: string
  lender: string
  totalAmount: string
  emiAmount: string
  totalMonths: string
  remainingMonths: string
  dueDate: string
  startDate: string
  interestRate: string
  status: EMIStatus
  notes: string
}

const INITIAL_FORM: EMIFormData = {
  memberId: '',
  loanName: '',
  lender: '',
  totalAmount: '',
  emiAmount: '',
  totalMonths: '',
  remainingMonths: '',
  dueDate: '1',
  startDate: new Date().toISOString().slice(0, 10),
  interestRate: '',
  status: 'Active',
  notes: '',
}

export default function EMIManager() {
  const { toast } = useToast()
  const [emis, setEmis] = useState<EMI[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | EMIStatus>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EMI | null>(null)
  const [formData, setFormData] = useState<EMIFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setMembers(familyMemberService.getAll())
    setEmis(emiService.getAll())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const memberMap = React.useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const filtered = filterStatus === 'all' ? emis : emis.filter((e) => e.status === filterStatus)
  const activeEMIs = emis.filter((e) => e.status === 'Active')
  const totalMonthlyEMI = emiService.getTotalMonthlyEMI()
  const upcomingCount = emiService.getUpcoming(7).length

  function openAdd() {
    setEditingEMI(null)
    setFormData({ ...INITIAL_FORM, memberId: members[0]?.id ?? '' })
    setIsDialogOpen(true)
  }

  function openEdit(emi: EMI) {
    setEditingEMI(emi)
    setFormData({
      memberId: emi.memberId,
      loanName: emi.loanName,
      lender: emi.lender,
      totalAmount: String(emi.totalAmount),
      emiAmount: String(emi.emiAmount),
      totalMonths: String(emi.totalMonths),
      remainingMonths: String(emi.remainingMonths),
      dueDate: String(emi.dueDate),
      startDate: emi.startDate,
      interestRate: String(emi.interestRate),
      status: emi.status,
      notes: emi.notes,
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingEMI(null)
    setFormData(INITIAL_FORM)
  }

  async function handleSave() {
    const required = [formData.loanName, formData.lender, formData.emiAmount, formData.memberId]
    if (required.some((v) => !v.trim())) {
      toast('Please fill all required fields.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        memberId: formData.memberId,
        loanName: formData.loanName.trim(),
        lender: formData.lender.trim(),
        totalAmount: parseFloat(formData.totalAmount) || 0,
        emiAmount: parseFloat(formData.emiAmount),
        totalMonths: parseInt(formData.totalMonths) || 0,
        remainingMonths: parseInt(formData.remainingMonths) || 0,
        dueDate: parseInt(formData.dueDate),
        startDate: formData.startDate,
        interestRate: parseFloat(formData.interestRate) || 0,
        status: formData.status,
        notes: formData.notes.trim(),
      }
      if (editingEMI) {
        emiService.update(editingEMI.id, payload)
        toast('EMI updated.', 'success')
      } else {
        emiService.create(payload)
        toast('EMI added.', 'success')
      }
      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    emiService.delete(deleteTarget.id)
    toast('EMI deleted.', 'success')
    setDeleteTarget(null)
    loadData()
  }

  function updateField<K extends keyof EMIFormData>(key: K, val: EMIFormData[K]) {
    setFormData((p) => ({ ...p, [key]: val }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="EMI Tracker"
        description="Manage all your loans and EMI schedules."
        action={openAdd}
        actionLabel="Add EMI"
        actionIcon={<Plus className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Monthly EMI Load"
          value={formatCurrency(totalMonthlyEMI)}
          icon={<CreditCard className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-500/10"
        />
        <StatCard
          label="Active Loans"
          value={String(activeEMIs.length)}
          icon={<TrendingDown className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
        />
        <StatCard
          label="Due in 7 Days"
          value={String(upcomingCount)}
          icon={<Calendar className="h-5 w-5 text-yellow-500" />}
          iconBg="bg-yellow-500/10"
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
          icon={<CreditCard className="h-8 w-8" />}
          title="No EMIs found"
          description="Add your first loan EMI to track it here."
          action={openAdd}
          actionLabel="Add EMI"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emi) => {
            const member = memberMap.get(emi.memberId)
            const progress = calculateEMIProgress(emi)
            const paid = calculateEMIPaid(emi)
            const remaining = calculateEMIRemaining(emi)
            const daysLeft = getDaysUntilDue(emi.dueDate)

            return (
              <motion.div
                key={emi.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold truncate">
                          {emi.loanName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{emi.lender}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[emi.status]}`}
                        >
                          {emi.status}
                        </span>
                        {member && <MemberAvatar member={member} size="sm" showTooltip />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* EMI amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Monthly EMI</span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(emi.emiAmount)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress ({progress}%)</span>
                        <span>{emi.remainingMonths} months left</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">Total Amount</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {formatCurrency(emi.totalAmount)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">Remaining</p>
                        <p className="text-xs font-semibold text-red-500 mt-0.5">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">Interest Rate</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {emi.interestRate}% p.a.
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">Due Date</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {daysLeft === 0 ? (
                            <span className="text-destructive">Today</span>
                          ) : (
                            `${daysLeft}d · Day ${emi.dueDate}`
                          )}
                        </p>
                      </div>
                    </div>

                    {emi.notes && (
                      <p className="text-xs text-muted-foreground truncate">{emi.notes}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => openEdit(emi)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:border-destructive/60"
                        onClick={() => setDeleteTarget(emi)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEMI ? 'Edit EMI' : 'Add EMI'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
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
              <Label htmlFor="emi-name">Loan Name *</Label>
              <Input
                id="emi-name"
                placeholder="e.g. Home Loan"
                value={formData.loanName}
                onChange={(e) => updateField('loanName', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-lender">Lender *</Label>
              <Input
                id="emi-lender"
                placeholder="e.g. HDFC Bank"
                value={formData.lender}
                onChange={(e) => updateField('lender', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-total">Total Loan Amount (₹)</Label>
              <Input
                id="emi-total"
                type="number"
                min="0"
                placeholder="5000000"
                value={formData.totalAmount}
                onChange={(e) => updateField('totalAmount', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-amount">EMI Amount (₹) *</Label>
              <Input
                id="emi-amount"
                type="number"
                min="0"
                placeholder="45000"
                value={formData.emiAmount}
                onChange={(e) => updateField('emiAmount', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-total-months">Total Months</Label>
              <Input
                id="emi-total-months"
                type="number"
                min="1"
                placeholder="240"
                value={formData.totalMonths}
                onChange={(e) => updateField('totalMonths', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-remaining">Remaining Months</Label>
              <Input
                id="emi-remaining"
                type="number"
                min="0"
                placeholder="192"
                value={formData.remainingMonths}
                onChange={(e) => updateField('remainingMonths', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-due">Due Day of Month</Label>
              <Input
                id="emi-due"
                type="number"
                min="1"
                max="31"
                placeholder="5"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-interest">Interest Rate (%)</Label>
              <Input
                id="emi-interest"
                type="number"
                min="0"
                step="0.1"
                placeholder="8.5"
                value={formData.interestRate}
                onChange={(e) => updateField('interestRate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emi-start">Start Date</Label>
              <Input
                id="emi-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField('status', v as EMIStatus)}>
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

            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label htmlFor="emi-notes">Notes</Label>
              <Textarea
                id="emi-notes"
                placeholder="Optional notes…"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.loanName.trim() || !formData.emiAmount}
            >
              {saving ? 'Saving…' : editingEMI ? 'Save Changes' : 'Add EMI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete EMI"
        message={`Delete "${deleteTarget?.loanName}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
