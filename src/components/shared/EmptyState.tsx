import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: () => void
  actionLabel?: string
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-8' : 'py-16',
        className,
      )}
    >
      <div className={cn(
        'flex items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4',
        compact ? 'h-10 w-10' : 'h-16 w-16 mb-5',
      )}>
        {icon}
      </div>

      <h3 className={cn(
        'font-semibold text-foreground mb-1.5',
        compact ? 'text-sm' : 'text-base',
      )}>{title}</h3>
      <p className={cn(
        'text-muted-foreground max-w-xs leading-relaxed',
        compact ? 'text-xs' : 'text-sm',
      )}>
        {description}
      </p>

      {action && actionLabel && (
        <Button onClick={action} className="mt-6" size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
