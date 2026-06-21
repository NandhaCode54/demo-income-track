import { format, parseISO } from 'date-fns'

/**
 * Format a number as currency with optional symbol override.
 * Falls back to INR (₹) if no symbol is provided.
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  const sign = amount < 0 ? '-' : ''
  return `${sign}${symbol}${formatted}`
}

/**
 * Format an ISO date string using the given format pattern.
 * Defaults to 'dd/MM/yyyy'.
 */
export function formatDate(date: string, fmt: string = 'dd/MM/yyyy'): string {
  if (!date) return ''
  try {
    // Convert format tokens from the app's convention (DD/MM/YYYY) to date-fns tokens
    const converted = fmt
      .replace(/YYYY/g, 'yyyy')
      .replace(/MM/g, 'MM')
      .replace(/DD/g, 'dd')
    return format(parseISO(date), converted)
  } catch {
    return date
  }
}

/**
 * Returns a full month + year string, e.g. 'January 2024'.
 */
export function formatMonth(date: string): string {
  if (!date) return ''
  try {
    return format(parseISO(date), 'MMMM yyyy')
  } catch {
    return date
  }
}

/**
 * Returns a short date string, e.g. 'Jan 15'.
 */
export function formatShortDate(date: string): string {
  if (!date) return ''
  try {
    return format(parseISO(date), 'MMM d')
  } catch {
    return date
  }
}

/**
 * Returns the month key for a given Date (or today) in 'YYYY-MM' format.
 */
export function getMonthKey(date?: Date): string {
  const d = date ?? new Date()
  return format(d, 'yyyy-MM')
}

/**
 * Returns uppercase initials from a name (up to 2 characters).
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Truncates text to maxLength and appends '…' if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Formats value/total as a percentage string, e.g. '42.5%'.
 * Returns '0%' when total is zero to avoid division by zero.
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
