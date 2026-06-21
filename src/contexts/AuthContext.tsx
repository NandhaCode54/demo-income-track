import React, { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import type { AuthSession } from '@/types'

interface AuthContextValue {
  session: AuthSession | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession())

  const login = useCallback((email: string, password: string) => {
    const result = authService.login(email, password)
    if (result.success) {
      setSession(authService.getSession())
    }
    return result
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const refreshSession = useCallback(() => {
    setSession(authService.getSession())
  }, [])

  return (
    <AuthContext.Provider value={{ session, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
