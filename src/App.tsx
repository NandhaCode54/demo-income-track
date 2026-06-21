import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/shared/Toaster'
import { useTheme } from '@/hooks/useTheme'
import Dashboard from '@/pages/Dashboard'
import FamilyMembers from '@/pages/FamilyMembers'
import Income from '@/pages/Income'
import Expenses from '@/pages/Expenses'
import EMIManager from '@/pages/EMIManager'
import Budget from '@/pages/Budget'
import SavingsGoals from '@/pages/SavingsGoals'
import Reports from '@/pages/Reports'
import Calendar from '@/pages/Calendar'
import Settings from '@/pages/Settings'

export default function App() {
  // Calling useTheme here applies the persisted theme to <html> on mount
  useTheme()

  return (
    <>
      {/* Single root Toaster — shares singleton state with useToast() in pages */}
      <Toaster />

      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<FamilyMembers />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/emi" element={<EMIManager />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/savings" element={<SavingsGoals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </>
  )
}
