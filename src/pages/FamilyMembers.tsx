import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { MemberAvatar } from '@/components/shared/MemberAvatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ColorPicker } from '@/components/shared/ColorPicker'
import { familyMemberService, expenseService } from '@/services'
import { formatCurrency } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import { MEMBER_ROLES, COLORS } from '@/constants'
import type { FamilyMember, MemberRole } from '@/types'

// ---------------------------------------------------------------------------
// Role badge color map — static strings so Tailwind JIT picks them up
// ---------------------------------------------------------------------------
const ROLE_BADGE: Record<MemberRole, string> = {
  Parent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Spouse: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  Child: 'bg-green-500/10 text-green-500 border-green-500/20',
  Guardian: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
interface MemberFormData {
  name: string
  email: string
  phone: string
  role: MemberRole
  monthlyIncome: string
  color: string
}

const INITIAL_FORM: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Parent',
  monthlyIncome: '',
  color: COLORS[0],
}

// ---------------------------------------------------------------------------
// MemberCard (inline component)
// ---------------------------------------------------------------------------
interface MemberCardProps {
  member: FamilyMember
  totalExpenses: number
  totalFamilyIncome: number
  onEdit: (member: FamilyMember) => void
  onDelete: (member: FamilyMember) => void
}

function MemberCard({
  member,
  totalExpenses,
  totalFamilyIncome,
  onEdit,
  onDelete,
}: MemberCardProps) {
  const contribution =
    totalFamilyIncome > 0
      ? ((member.monthlyIncome / totalFamilyIncome) * 100).toFixed(1)
      : '0'

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        {/* Avatar centered */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <MemberAvatar member={member} size="lg" showTooltip={false} />
          <div className="text-center">
            <p className="font-semibold text-foreground text-base leading-tight">
              {member.name}
            </p>
            <span
              className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                ROLE_BADGE[member.role]
              }`}
            >
              {member.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-5">
          <div className="rounded-lg bg-muted/60 px-1.5 py-2.5 text-center">
            <p className="text-[9px] text-muted-foreground leading-tight mb-1 whitespace-nowrap">
              Income
            </p>
            <p className="text-[11px] font-bold text-foreground leading-tight">
              {formatCurrency(member.monthlyIncome)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/60 px-1.5 py-2.5 text-center">
            <p className="text-[9px] text-muted-foreground leading-tight mb-1 whitespace-nowrap">
              Expenses
            </p>
            <p className="text-[11px] font-bold text-foreground leading-tight">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/60 px-1.5 py-2.5 text-center">
            <p className="text-[9px] text-muted-foreground leading-tight mb-1 whitespace-nowrap">
              Share
            </p>
            <p className="text-[11px] font-bold text-foreground leading-tight">{contribution}%</p>
          </div>
        </div>

        {/* Contact info */}
        {(member.email || member.phone) && (
          <div className="mb-4 space-y-1">
            {member.email && (
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            )}
            {member.phone && (
              <p className="text-xs text-muted-foreground">{member.phone}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(member)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:border-destructive/60"
            onClick={() => onDelete(member)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function FamilyMembers() {
  const { toast } = useToast()

  const [members, setMembers] = useState<FamilyMember[]>([])
  const [memberExpenses, setMemberExpenses] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState<MemberFormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  // ---- Load ----
  const loadData = useCallback(() => {
    const all = familyMemberService.getAll()
    setMembers(all)

    const expMap: Record<string, number> = {}
    for (const m of all) {
      expMap[m.id] = expenseService
        .getByMember(m.id)
        .reduce((sum, e) => sum + e.amount, 0)
    }
    setMemberExpenses(expMap)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ---- Filter ----
  const filteredMembers = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : members

  const totalFamilyIncome = members.reduce((sum, m) => sum + m.monthlyIncome, 0)

  // ---- Dialog helpers ----
  function openAddDialog() {
    setEditingMember(null)
    setFormData(INITIAL_FORM)
    setIsDialogOpen(true)
  }

  function openEditDialog(member: FamilyMember) {
    setEditingMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      monthlyIncome: member.monthlyIncome > 0 ? String(member.monthlyIncome) : '',
      color: member.color,
    })
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingMember(null)
    setFormData(INITIAL_FORM)
  }

  // ---- Save ----
  async function handleSave() {
    if (!formData.name.trim()) {
      toast('Name is required.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        avatar: formData.name.trim().slice(0, 2).toUpperCase(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        color: formData.color,
      }

      if (editingMember) {
        familyMemberService.update(editingMember.id, payload)
        toast(`${formData.name} updated successfully.`, 'success')
      } else {
        familyMemberService.create(payload)
        toast(`${formData.name} added to the family.`, 'success')
      }

      loadData()
      closeDialog()
    } finally {
      setSaving(false)
    }
  }

  // ---- Delete ----
  function handleDeleteConfirm() {
    if (!deleteTarget) return
    familyMemberService.delete(deleteTarget.id)
    toast(`${deleteTarget.name} has been removed.`, 'success')
    setDeleteTarget(null)
    loadData()
  }

  // ---- Form field updater ----
  function updateField<K extends keyof MemberFormData>(key: K, value: MemberFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Family Members"
        description="Manage your family members and their financial profiles."
        action={openAddDialog}
        actionLabel="Add Member"
        actionIcon={<Plus className="h-4 w-4" />}
      />

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, role or email…"
        className="max-w-sm"
      />

      {/* Member grid */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={
            searchQuery
              ? 'No members match your search'
              : 'No family members yet'
          }
          description={
            searchQuery
              ? 'Try a different name, role, or email.'
              : 'Add your first family member to get started.'
          }
          action={searchQuery ? undefined : openAddDialog}
          actionLabel="Add Member"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              totalExpenses={memberExpenses[member.id] ?? 0}
              totalFamilyIncome={totalFamilyIncome}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Member' : 'Add Family Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Rajesh Kumar"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => updateField('role', val as MemberRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Income */}
            <div className="space-y-1.5">
              <Label htmlFor="income">Monthly Income (₹)</Label>
              <Input
                id="income"
                type="number"
                min="0"
                placeholder="0"
                value={formData.monthlyIncome}
                onChange={(e) => updateField('monthlyIncome', e.target.value)}
              />
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>Avatar Color</Label>
              <ColorPicker
                value={formData.color}
                onChange={(color) => updateField('color', color)}
              />
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name.trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{formData.name}</p>
                  <p className="text-xs text-muted-foreground">{formData.role}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? 'Saving…' : editingMember ? 'Save Changes' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Member"
        message={`Are you sure you want to remove ${deleteTarget?.name ?? 'this member'}? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  )
}
