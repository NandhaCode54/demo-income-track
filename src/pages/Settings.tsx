import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon, Moon, Sun, Monitor, Globe, Bell, Trash2, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
    </div>
  )
}
