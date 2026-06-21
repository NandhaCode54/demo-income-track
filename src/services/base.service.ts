import { v4 as uuidv4 } from 'uuid'

export class BaseService<
  T extends { id: string; createdAt: string; updatedAt: string },
> {
  protected key: string

  constructor(key: string) {
    this.key = key
  }

  protected getAll(): T[] {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return []
      return JSON.parse(raw) as T[]
    } catch {
      return []
    }
  }

  protected setAll(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items))
  }

  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id)
  }

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date().toISOString()
    const newItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    } as T
    const all = this.getAll()
    all.push(newItem)
    this.setAll(all)
    return newItem
  }

  update(id: string, updates: Partial<T>): T | null {
    const all = this.getAll()
    const index = all.findIndex((item) => item.id === id)
    if (index === -1) return null
    const updated = {
      ...all[index],
      ...updates,
      id, // prevent id overwrite
      updatedAt: new Date().toISOString(),
    }
    all[index] = updated
    this.setAll(all)
    return updated
  }

  delete(id: string): boolean {
    const all = this.getAll()
    const filtered = all.filter((item) => item.id !== id)
    if (filtered.length === all.length) return false
    this.setAll(filtered)
    return true
  }

  clear(): void {
    localStorage.removeItem(this.key)
  }
}
