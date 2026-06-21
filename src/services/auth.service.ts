import { v4 as uuidv4 } from 'uuid'
import type { User, AuthSession, UserRole } from '@/types'

const USERS_KEY = 'ffm_users'
const SESSION_KEY = 'ffm_session'

// ---------------------------------------------------------------------------
// Simple one-way hash — NOT cryptographically secure, fine for localStorage demo
// ---------------------------------------------------------------------------
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

class AuthService {
  private getUsers(): User[] {
    try {
      const raw = localStorage.getItem(USERS_KEY)
      return raw ? (JSON.parse(raw) as User[]) : []
    } catch {
      return []
    }
  }

  private setUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      return null
    }
  }

  private setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
  }

  isSeeded(): boolean {
    return this.getUsers().length > 0
  }

  seedDefaultUser(): void {
    if (this.isSeeded()) return
    const now = new Date().toISOString()
    const admin: User = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@family.com',
      passwordHash: simpleHash('family123'),
      role: 'admin',
      color: '#6366F1',
      createdAt: now,
      updatedAt: now,
    }
    this.setUsers([admin])
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
    if (!user) return { success: false, error: 'No account found with that email.' }
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password.' }
    }
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      color: user.color,
      familyMemberId: user.familyMemberId,
    }
    this.setSession(session)
    return { success: true }
  }

  register(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'member',
    color: string = '#6366F1',
    familyMemberId?: string,
  ): { success: boolean; error?: string } {
    const users = this.getUsers()
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())
    if (exists) return { success: false, error: 'An account with that email already exists.' }
    const now = new Date().toISOString()
    const newUser: User = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: simpleHash(password),
      role,
      color,
      familyMemberId,
      createdAt: now,
      updatedAt: now,
    }
    this.setUsers([...users, newUser])
    // auto-login
    this.setSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      color: newUser.color,
      familyMemberId: newUser.familyMemberId,
    })
    return { success: true }
  }

  logout(): void {
    this.clearSession()
  }

  getAllUsers(): User[] {
    return this.getUsers()
  }

  updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'color' | 'familyMemberId'>>): void {
    const users = this.getUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) return
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() }
    this.setUsers(users)
    // refresh session if it's the current user
    const session = this.getSession()
    if (session?.userId === userId) {
      this.setSession({ ...session, ...updates })
    }
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const users = this.getUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) return { success: false, error: 'User not found.' }
    if (user.passwordHash !== simpleHash(oldPassword)) {
      return { success: false, error: 'Current password is incorrect.' }
    }
    user.passwordHash = simpleHash(newPassword)
    user.updatedAt = new Date().toISOString()
    this.setUsers(users)
    return { success: true }
  }

  deleteUser(userId: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId)
    this.setUsers(users)
  }
}

export const authService = new AuthService()
