import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/shared/Toaster'
import { useTheme } from '@/hooks/useTheme'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/pages/auth/LoginPage'
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

// ---------------------------------------------------------------------------
// Route guard — redirects to /login when not authenticated
// ---------------------------------------------------------------------------
function ProtectedLayout() {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

// ---------------------------------------------------------------------------
// Auth-aware root router — login vs. app
// ---------------------------------------------------------------------------
function RootRouter() {
  const { session } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
export default function App() {
  useTheme()

  return (
    <AuthProvider>
      <Toaster />
      <RootRouter />
    </AuthProvider>
  )
}
