import React from 'react'
import { cn } from '@/utils/cn'

// ---------------------------------------------------------------------------
// Spinner — animated circle
// ---------------------------------------------------------------------------
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }[size]

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        sizeClass,
        className,
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// SkeletonCard — shimmer loading placeholder
// ---------------------------------------------------------------------------
interface SkeletonCardProps {
  className?: string
  lines?: number
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className,
      )}
    />
  )
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5 space-y-3',
        className,
      )}
    >
      {/* Icon + title row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoadingOverlay — full-page loading with spinner + optional message
// ---------------------------------------------------------------------------
interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Loading…' }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
