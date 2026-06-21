import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon, Moon, Sun, Monitor, Globe, Bell, Trash2, AlertTriangle,
  Users, Plus, Key, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS } from '@/constants'
import type { User } from '@/types'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { clearAllData } from '@/data/seedData'
import { CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS, DEFAULT_SETTINGS } from '@/constants'
import type { Settings, Theme } from '@/types'

const SETTINGS_KEY = 'ffm_settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export default function Settings() {
  const { toast } = useToast()
  const { theme, setTheme, isDark } = useTheme()
  const { session } = useAuth()
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // ---- User management state (admin only) ----
  const [users, setUsers] = useState<User[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', role: 'member' as 'admin' | 'member' })
  const [pwForm, setPwForm] = useState({ old: '', newPw: '', confirm: '' })

  useEffect(() => {
    if (session?.role === 'admin') {
      setUsers(authService.getAllUsers())
    }
  }, [session])

  useEffect(() => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [theme])

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  function handleSave() {
    saveSettings(settings)
    if (settings.theme !== theme) {
      setTheme(settings.theme)
    }
    setHasChanges(false)
    toast('Settings saved.', 'success')
  }

  function handleThemeChange(newTheme: Theme) {
    updateSetting('theme', newTheme)
    setTheme(newTheme)
  }

  function handleCurrencyChange(code: string) {
    const option = CURRENCY_OPTIONS.find((c) => c.code === code)
    if (option) {
      updateSetting('currency', code)
      updateSetting('currencySymbol', option.symbol)
    }
  }

  function handleClearAll() {
    clearAllData()
    toast('All data cleared. Reload the page to see changes.', 'warning')
    setShowClearConfirm(false)
  }

  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.code === settings.currency)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Configure your Family Finance Manager preferences."
      />

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'light' as Theme, label: 'Light', icon: Sun },
                { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                { value: 'system' as Theme, label: 'System', icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                    settings.theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-base">Regional</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Family Name</Label>
            <Input
              placeholder="My Family"
              value={settings.familyName}
              onChange={(e) => updateSetting('familyName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCurrency && (
                <p className="text-xs text-muted-foreground">
                  Symbol: <span className="font-semibold">{selectedCurrency.symbol}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(v) => updateSetting('dateFormat', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
              <Bell className="h-4 w-4 text-yellow-500" />
            </div>
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts for upcoming events</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(v) => updateSetting('notifications', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Budget Alerts</p>
              <p className="text-xs text-muted-foreground">Alert when budget threshold is reached</p>
            </div>
            <Switch
              checked={settings.monthlyBudgetAlert}
              onCheckedChange={(v) => updateSetting('monthlyBudgetAlert', v)}
              disabled={!settings.notifications}
            />
          </div>

          {settings.monthlyBudgetAlert && settings.notifications && (
            <div className="space-y-1.5">
              <Label>Alert Threshold (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  className="w-24"
                  value={settings.budgetAlertThreshold}
                  onChange={(e) => updateSetting('budgetAlertThreshold', parseInt(e.target.value) || 80)}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when spending reaches {settings.budgetAlertThreshold}% of budget
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Clear All Data</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete all family members, transactions, EMIs, budgets, and goals.
                This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          {hasChanges ? 'You have unsaved changes.' : 'All changes saved.'}
        </p>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* User Accounts (admin only) */}
      {session?.role === 'admin' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle className="text-base">User Accounts</CardTitle>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddUser(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: u.color }}
                >
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                  {u.role}
                </Badge>
                {u.id !== session.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-7 px-2 shrink-0"
                    onClick={() => {
                      authService.deleteUser(u.id)
                      setUsers(authService.getAllUsers())
                      toast(`${u.name} removed.`, 'success')
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <Key className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-base">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowChangePassword(true)}>
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showClearConfirm}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
        title="Clear All Data"
        message="This will permanently delete ALL your family data — members, income, expenses, EMIs, budgets, and savings goals. This cannot be undone. Are you sure?"
        variant="danger"
        confirmLabel="Yes, Clear Everything"
        cancelLabel="Cancel"
      />

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={(o) => !o && setShowAddUser(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Priya Kumar" value={addUserForm.name} onChange={(e) => setAddUserForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="priya@family.com" value={addUserForm.email} onChange={(e) => setAddUserForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="min 6 characters" value={addUserForm.password} onChange={(e) => setAddUserForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Admin Role</p>
                <p className="text-xs text-muted-foreground">Can manage users & all data</p>
              </div>
              <Switch
                checked={addUserForm.role === 'admin'}
                onCheckedChange={(v) => setAddUserForm((p) => ({ ...p, role: v ? 'admin' : 'member' }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
                toast('Please fill all fields.', 'error'); return
              }
              const color = COLORS[Math.floor(Math.random() * COLORS.length)]
              const result = authService.register(addUserForm.name, addUserForm.email, addUserForm.password, addUserForm.role, color)
              if (!result.success) { toast(result.error ?? 'Failed.', 'error'); return }
              toast(`${addUserForm.name} added.`, 'success')
              setUsers(authService.getAllUsers())
              setAddUserForm({ name: '', email: '', password: '', role: 'member' })
              setShowAddUser(false)
            }}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={(o) => !o && setShowChangePassword(false)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" value={pwForm.old} onChange={(e) => setPwForm((p) => ({ ...p, old: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" placeholder="min 6 characters" value={pwForm.newPw} onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowChangePassword(false); setPwForm({ old: '', newPw: '', confirm: '' }) }}>Cancel</Button>
            <Button onClick={() => {
              if (!pwForm.old || !pwForm.newPw || !pwForm.confirm) { toast('Please fill all fields.', 'error'); return }
              if (pwForm.newPw !== pwForm.confirm) { toast('Passwords do not match.', 'error'); return }
              if (pwForm.newPw.length < 6) { toast('Min 6 characters.', 'error'); return }
              if (!session) return
              const result = authService.changePassword(session.userId, pwForm.old, pwForm.newPw)
              if (!result.success) { toast(result.error ?? 'Failed.', 'error'); return }
              toast('Password changed successfully.', 'success')
              setShowChangePassword(false)
              setPwForm({ old: '', newPw: '', confirm: '' })
            }}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
